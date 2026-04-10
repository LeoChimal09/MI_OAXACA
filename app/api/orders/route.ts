import { NextRequest, NextResponse } from "next/server";
import {
  createOrder,
  getAllOrders,
  getOrdersByCustomerEmail,
  getOrdersByRefs,
} from "@/server/repositories/orders-repository";
import type { CreateOrderInput } from "@/features/checkout/checkout.types";
import { calculateOrderSubtotal } from "@/features/checkout/order-pricing";
import { getAuthSession, isAdminSession } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limiter";
import { sendAdminNewOrderEmail, sendCustomerOrderReceivedEmail } from "@/lib/resend-mailer";

const MAX_GUEST_REFS = 50;
const ORDER_REF_PATTERN = /^(MIO|TBL)-[A-Z0-9-]{6,64}$/;

function isCreateOrderInput(value: unknown): value is CreateOrderInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CreateOrderInput>;
  return Boolean(candidate.form) && Array.isArray(candidate.orders) && typeof candidate.totalPrice === "number";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const scope = (url.searchParams.get("scope") ?? "").trim().toLowerCase();
  const session = await getAuthSession();
  const sessionEmail = session?.user?.email?.trim().toLowerCase();

  if (scope === "admin") {
    // Admin access requires authentication and admin role
    if (!session || !isAdminSession(session)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    try {
      return NextResponse.json(await getAllOrders());
    } catch {
      return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
    }
  }

  if (sessionEmail) {
    try {
      return NextResponse.json(await getOrdersByCustomerEmail(sessionEmail));
    } catch {
      return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
    }
  }

  // Guest mode: customers access their own orders by reference
  const refsParam = url.searchParams.get("refs") ?? "";
  const refs = refsParam
    .split(",")
    .map((value) => value.trim())
    .filter((value) => Boolean(value) && ORDER_REF_PATTERN.test(value))
    .slice(0, MAX_GUEST_REFS);

  if (refs.length === 0) {
    return NextResponse.json([]);
  }

  return NextResponse.json(await getOrdersByRefs(refs));
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 orders per IP per minute
  const clientIp = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  if (isRateLimited(`order-create:${clientIp}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);

  if (!isCreateOrderInput(body)) {
    return NextResponse.json({ error: "Invalid order payload." }, { status: 400 });
  }

  const subtotal = calculateOrderSubtotal(body.orders);
  const normalizedEmail = body.form.email?.trim().toLowerCase() || null;

  try {
    const order = await createOrder(
      {
        ...body,
        totalPrice: subtotal,
      },
      {
        customerEmail: normalizedEmail,
      },
    );

    if (order.paymentStatus === "paid") {
      void sendAdminNewOrderEmail({ order }).catch(() => undefined);
      void sendCustomerOrderReceivedEmail({ email: order.form.email.trim().toLowerCase(), order }).catch(() => undefined);
    }

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}
