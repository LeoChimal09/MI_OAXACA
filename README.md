# Mi Oaxaca

A full-stack restaurant ordering platform — from browsing the menu to real-time order tracking — built end-to-end with Next.js 16, React 19, TypeScript, Stripe, and MySQL.

> **Why this exists:** Local restaurants often depend on phone calls or third-party apps that take large commissions and give zero control over the customer experience. Mi Oaxaca gives a restaurant its own branded ordering flow, real-time order dashboard, and direct customer communication — no middleware tax.

---

## Screenshots

| Menu & Cart | Checkout | Admin Dashboard |
|---|---|---|
| _(coming soon)_ | _(coming soon)_ | _(coming soon)_ |

---

## What It Does

**For customers**
- Browse a categorized menu with photos and prices
- Add items to a persistent cart (survives page refresh)
- Check out with Stripe (card payments)
- Receive an email confirmation with order details
- Track their order in real time — status updates pushed by the admin

**For the restaurant admin**
- Google-authenticated dashboard (no separate password to manage)
- Live orders board — new paid orders appear automatically
- Advance orders through `pending → in_progress → ready → completed`
- Cancel orders with a note; customer is notified by email instantly
- Restaurant open/close hours enforced at the API layer — orders blocked outside hours

---

## Architecture

```
Browser (React 19 / Next.js App Router)
  │
  │  RSC page shells + client components
  │
  ├─► /api/payments/checkout-session   → creates Stripe Checkout session
  ├─► /api/orders                      → CRUD for orders (rate-limited)
  ├─► /api/restaurant-status           → open/closed check
  ├─► /api/webhooks/stripe             → listens for payment confirmation
  │     └─► marks order paid, emails admin
  └─► /api/auth (NextAuth)             → Google OAuth (admin) + magic-link (customer)
          │
          ▼
      Drizzle ORM
          │
          ▼
      MySQL (Docker in dev / managed DB in prod)
          └── orders  ·  customers  ·  email_verification_tokens
```

**Key design decisions**
- **App Router** — co-located server and client components; API routes in `app/api/`
- **Passwordless customers** — one-time email tokens (no password storage, no OAuth dependency for end-users)
- **Stripe Webhooks** — payment confirmation happens server-side; the UI never trusts client-reported payment state
- **Drizzle ORM** — type-safe queries with schema-as-code and migration tracking
- **Rate limiter** — custom in-memory limiter on sensitive endpoints to prevent abuse

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript, MUI v7, Tailwind CSS v4 |
| Payments | Stripe Checkout + Webhooks |
| Auth | NextAuth v4 — Google OAuth (admin), magic-link email (customers) |
| ORM | Drizzle ORM |
| Database | MySQL 8 |
| Email | Resend |
| Testing | Vitest |
| Dev infra | Docker Compose (MySQL) |

---

## Email Notifications

| Trigger | Recipient |
|---|---|
| New paid order | Admin — "new order" alert |
| Order moved to `in_progress` | Customer |
| Order moved to `ready` | Customer |
| Order cancelled by admin | Customer (includes cancellation note) |

---

## Local Setup

### Prerequisites
- Node.js 20+
- Docker (for the local MySQL container)

### Steps

1. **Install dependencies**

```bash
npm install
```

2. **Start the database**

```bash
docker compose up -d
```

3. **Configure environment variables** — create `.env`:

```env
DATABASE_URL=mysql://mioaxaca:mioaxaca@localhost:3307/mioaxaca
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=replace-with-a-long-random-secret

# Google admin OAuth
GOOGLE_ID=your-google-oauth-client-id
GOOGLE_SECRET=your-google-oauth-client-secret
ADMIN_EMAILS=owner@example.com

# Admin test mode (local only — bypasses Google OAuth)
ADMIN_TEST_MODE=false
TEST_ADMIN_EMAILS=developer@example.com

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM="Mi Oaxaca <noreply@example.com>"
ADMIN_NOTIFICATION_EMAILS=owner@example.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Restaurant hours (optional — defaults to 9 AM–10 PM UTC)
RESTAURANT_OPEN_TIME="10:00 AM"
RESTAURANT_CLOSE_TIME="09:00 PM"
RESTAURANT_TIMEZONE="America/Chicago"
```

4. **Run database migrations**

```bash
npm run db:migrate
```

5. **Start the dev server**

```bash
npm run dev
```

6. Open `http://localhost:3000`

### Google OAuth (local)

In your Google Cloud OAuth Client:
- **Authorized JavaScript origins:** `http://localhost:3000`
- **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`

---

## Useful Commands

```bash
npm run dev          # start dev server (webpack)
npm run build        # production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run test         # Vitest (watch)
npm run test:run     # Vitest (CI / single run)
npm run db:migrate   # apply pending migrations
npm run db:studio    # open Drizzle Studio (DB GUI)
```

---

## Roadmap

### Phase 1 — Active
- Stabilize customer ordering and admin order operations

### Phase 2 — Planned
- Billing module (revenue summary, export)
- Reports module (popular items, peak hours)

### Phase 3 — Later
- Multi-location support
- Push notifications (Web Push API)
