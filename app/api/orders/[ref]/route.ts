import { NextRequest, NextResponse } from "next/server";
import {
  deleteOrder,
  dismissOrderNotification,
  getOrderWithCustomerEmail,
  updateOrderStatus,
} from "@/server/repositories/orders-repository";
import type { CancellationActor, OrderEtaMinutes, OrderStatus } from "@/features/checkout/checkout.types";
import {
  canTransitionOrderStatus,
  isValidOrderEtaMinutes,
} from "@/features/checkout/order-status";
import { getAuthSession, isAdminSession } from "@/lib/auth";
import { isRateLimited, getRemainingAttempts } from "@/lib/rate-limiter";
import { sendCustomerOrderStatusUpdateEmail, sendAdminOrderCancelledEmail } from "@/lib/resend-mailer";

const VALID_ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "in_progress",
  "ready",
  "completed",
  "cancelled",
];
const VALID_CANCELLATION_ACTORS: CancellationActor[] = ["admin", "customer"];

type OrderRouteContext = {
  params: Promise<{
    ref: string;
  }>;
};

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && VALID_ORDER_STATUSES.includes(value as OrderStatus);
}

function getSessionEmail(session: Awaited<ReturnType<typeof getAuthSession>>) {
  return session?.user?.email?.trim().toLowerCase() ?? null;
}

export async function GET(request: NextRequest, context: OrderRouteContext) {
  const { ref } = await context.params;
  const clientIp = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  const rateLimitKey = `order-lookup:${clientIp}`;

  // Rate limit: 10 lookups per IP per minute
  if (isRateLimited(rateLimitKey, 10, 60_000)) {
    const remaining = getRemainingAttempts(rateLimitKey, 10);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": remaining.toString(),
        },
      },
    );
  }

  const session = await getAuthSession();
  const orderResult = await getOrderWithCustomerEmail(ref);

  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!orderResult) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const isAdmin = isAdminSession(session);
  const sessionEmail = getSessionEmail(session);
  const isOwner = Boolean(
    sessionEmail && orderResult.customerEmail && sessionEmail === orderResult.customerEmail,
  );

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json(orderResult.order);
}

export async function PATCH(request: NextRequest, context: OrderRouteContext) {
  const { ref } = await context.params;
  const session = await getAuthSession();
  const body = await request.json().catch(() => null);
  const status = body && typeof body === "object" ? (body as { status?: unknown }).status : undefined;
  const etaMinutes = body && typeof body === "object" ? (body as { etaMinutes?: unknown }).etaMinutes : undefined;
  const cancellationNote =
    body && typeof body === "object" ? (body as { cancellationNote?: unknown }).cancellationNote : undefined;
  const cancelledBy = body && typeof body === "object" ? (body as { cancelledBy?: unknown }).cancelledBy : undefined;
  const notificationDismissed =
    body && typeof body === "object" ? (body as { notificationDismissed?: unknown }).notificationDismissed : undefined;

  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const existingOrderResult = await getOrderWithCustomerEmail(ref);
  if (!existingOrderResult) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const isAdmin = isAdminSession(session);
  const sessionEmail = getSessionEmail(session);
  const isOwner = Boolean(
    sessionEmail &&
      existingOrderResult.customerEmail &&
      sessionEmail === existingOrderResult.customerEmail,
  );

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const existingOrder = existingOrderResult.order;

  // Allow only authorized customer/admin to dismiss notifications
  if (notificationDismissed === true) {
    const dismissed = await dismissOrderNotification(ref);
    if (!dismissed) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json(dismissed);
  }

  // Status updates require admin access
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (!isOrderStatus(status)) {
    return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  }

  if (!canTransitionOrderStatus(existingOrder.status, status)) {
    return NextResponse.json(
      {
        error:
          status === "cancelled"
            ? "Only pending orders can be cancelled."
            : "This order cannot move to that status from its current state.",
      },
      { status: 409 },
    );
  }

  let parsedEtaMinutes: OrderEtaMinutes | null | undefined;
  let parsedCancellationNote: string | null | undefined;
  let parsedCancelledBy: CancellationActor | null | undefined;

  if (etaMinutes !== undefined && etaMinutes !== null) {
    if (!isValidOrderEtaMinutes(etaMinutes)) {
      return NextResponse.json({ error: "Invalid ETA value." }, { status: 400 });
    }

    parsedEtaMinutes = etaMinutes;
  }

  if (status === "in_progress" && existingOrder.status !== "in_progress" && !parsedEtaMinutes) {
    return NextResponse.json(
      { error: "Please select an ETA when moving an order to In Progress." },
      { status: 400 },
    );
  }

  if (cancellationNote !== undefined && cancellationNote !== null) {
    if (typeof cancellationNote !== "string") {
      return NextResponse.json({ error: "Invalid cancellation note." }, { status: 400 });
    }

    parsedCancellationNote = cancellationNote.trim() || null;
  }

  if (parsedCancellationNote && parsedCancellationNote.length > 300) {
    return NextResponse.json({ error: "Cancellation note must be 300 characters or less." }, { status: 400 });
  }

  // Admins may set cancelledBy; prevent privilege escalation
  if (cancelledBy !== undefined && cancelledBy !== null) {
    if (typeof cancelledBy !== "string" || !VALID_CANCELLATION_ACTORS.includes(cancelledBy as CancellationActor)) {
      return NextResponse.json({ error: "Invalid cancellation actor." }, { status: 400 });
    }

    if (isAdmin) {
      parsedCancelledBy = cancelledBy as CancellationActor;
    }
  }

  if (status === "cancelled" && !parsedCancelledBy) {
    parsedCancelledBy = "admin";
  }

  const order = await updateOrderStatus(ref, status, {
    etaMinutes: parsedEtaMinutes,
    cancellationNote: parsedCancellationNote,
    cancelledBy: parsedCancelledBy,
  });

  if (order === undefined) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const recipientEmails = Array.from(
    new Set(
      [
        order.form.email.trim().toLowerCase(),
        existingOrderResult.customerEmail ?? "",
      ].filter(Boolean),
    ),
  );

  const shouldEmailCustomer =
    recipientEmails.length > 0 &&
    existingOrder.status !== order.status &&
    (order.status === "in_progress" || order.status === "ready");

  if (shouldEmailCustomer) {
    void sendCustomerOrderStatusUpdateEmail({ email: recipientEmails, order }).catch(() => undefined);
  }

  // Notify admin if customer cancelled the order
  const isCustomerCancellation = order.status === "cancelled" && parsedCancelledBy === "customer" && existingOrder.status !== "cancelled";
  if (isCustomerCancellation) {
    void sendAdminOrderCancelledEmail({ order, cancellationNote: parsedCancellationNote }).catch(() => undefined);
  }

  return NextResponse.json(order);
}

export async function DELETE(request: NextRequest, context: OrderRouteContext) {
  const { ref } = await context.params;
  const session = await getAuthSession();
  const isAdmin = session ? isAdminSession(session) : false;

  // Only admins can delete orders
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const removed = await deleteOrder(ref);

  if (removed === null) {
    return NextResponse.json(
      { error: "Only completed or cancelled orders can be removed from history." },
      { status: 409 },
    );
  }

  if (!removed) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
