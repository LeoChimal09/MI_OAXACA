# Mi Oaxaca

Restaurant web app for customer ordering and admin operations.

## Current Scope

- Customer flow: menu, cart, checkout, order confirmation, orders list, order detail.
- Live order progression: customer views update from admin status changes.
- Admin area:
	- Orders: live and available now.
	- Billing: planned for a later phase.
	- Reports: planned for a later phase.

## Tech Stack

- Next.js App Router
- React + TypeScript
- MUI
- Drizzle ORM
- MySQL

## Authentication and Email

- Admin authentication: Google OAuth via NextAuth.
- Customer authentication: one-time email verification links.
- Email delivery: Resend.
- Order emails:
	- Admins receive "new order" notifications (paid orders).
	- Customers receive order status updates when admin moves orders to `in_progress`, `ready`, or admin-cancelled.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```env
DATABASE_URL=mysql://mioaxaca:mioaxaca@localhost:3307/mioaxaca
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=replace-with-a-long-random-secret

# Google admin OAuth
GOOGLE_ID=google-oauth-client-id
GOOGLE_SECRET=google-oauth-client-secret
ADMIN_EMAILS=owner@example.com

# Admin test mode (local development only)
ADMIN_TEST_MODE=false
TEST_ADMIN_EMAILS=developer@example.com

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM="Mi Oaxaca <noreply@example.com>"
ADMIN_NOTIFICATION_EMAILS=owner@example.com
```

3. Run database migrations:

```bash
npm run db:migrate
```

4. Start development server:

```bash
npm run dev
```

5. Open:

```text
http://localhost:3000
```

## Google OAuth Local Values

In Google Cloud OAuth Client:

- Authorized JavaScript origins:
	- `http://localhost:3000`
- Authorized redirect URIs:
	- `http://localhost:3000/api/auth/callback/google`

## Useful Commands

```bash
npm run dev
npm run lint
npm run db:migrate
```

## Roadmap

### Phase 1 (Active)

- Stabilize customer ordering and admin order operations.

### Phase 2 (Planned)

- Billing module in admin.
- Reports module in admin.

### Phase 3 (Later)

- Additional admin modules as needed.
