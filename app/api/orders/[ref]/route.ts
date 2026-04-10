import { NextRequest, NextResponse } from "next/server";
import {
  deleteOrder,
  dismissOrderNotification,
  getOrder,
  updateOrderStatus,
} from "@/server/repositories/orders-repository";
import type { CancellationActor, OrderEtaMinutes, OrderStatus } from "@/features/checkout/checkout.types";
import {
  canTransitionOrderStatus,
  isValidOrderEtaMinutes,
} from "@/features/checkout/order-status";
import { getAuthSession, isAdminSession } from "@/lib/auth";
import { isRateLimited, getRemainingAttempts } from "@/lib/rate-limiter";

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

  const order = await getOrder(ref);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(request: NextRequest, context: OrderRouteContext) {
  const { ref } = await context.params;
  const session = await getAuthSession();
  const isAdmin = session ? isAdminSession(session) : false;
  const body = await request.json().catch(() => null);
  const status = body && typeof body === "object" ? (body as { status?: unknown }).status : undefined;
  const etaMinutes = body && typeof body === "object" ? (body as { etaMinutes?: unknown }).etaMinutes : undefined;
  const cancellationNote =
    body && typeof body === "object" ? (body as { cancellationNote?: unknown }).cancellationNote : undefined;
  const cancelledBy = body && typeof body === "object" ? (body as { cancelledBy?: unknown }).cancelledBy : undefined;
  const notificationDismissed =
    body && typeof body === "object" ? (body as { notificationDismissed?: unknown }).notificationDismissed : undefined;

  const existingOrder = await getOrder(ref);
  if (!existingOrder) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Allow customers and admins to dismiss notifications
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
