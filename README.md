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

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```env
DATABASE_URL=mysql://mioaxaca:mioaxaca@localhost:3307/mioaxaca
```

3. Start development server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Useful Commands

```bash
npm run dev
npm run lint
```

## Roadmap

### Phase 1 (Active)

- Stabilize customer ordering and admin order operations.

### Phase 2 (Planned)

- Billing module in admin.
- Reports module in admin.

### Phase 3 (Later)

- Additional admin modules as needed.
