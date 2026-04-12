import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limiter";
import { getOrder, updateOrderPayment } from "@/server/repositories/orders-repository";

export const runtime = "nodejs";

type AbandonBody = {
  ref?: string;
  sessionId?: string;
};

export async function POST(request: Request) {
  const clientIp = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  if (isRateLimited(`payment-abandon:${clientIp}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as AbandonBody | null;
  const ref = body?.ref?.trim();
  const sessionId = body?.sessionId?.trim();

  if (!ref || !sessionId) {
    return NextResponse.json({ error: "Missing ref or sessionId." }, { status: 400 });
  }

  const order = await getOrder(ref);
  if (!order) {
    return NextResponse.json({ ok: true });
  }

  if (order.stripeCheckoutSessionId !== sessionId) {
    return NextResponse.json({ ok: true });
  }

  if (order.paymentStatus !== "pending") {
    return NextResponse.json({ ok: true });
  }

  await updateOrderPayment(ref, { paymentStatus: "failed" });

  return NextResponse.json({ ok: true });
}