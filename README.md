# Club Management System

A web-based platform for managing club membership, finances, events, and
communication.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Node.js + Express + TypeScript | Type-safe API, huge ecosystem, easy to demo/deploy |
| ORM / DB | Prisma + PostgreSQL | Migrations, type-safe queries, handles financial audit trails correctly |
| Frontend | React + Vite + TypeScript | Fast dev loop, component reuse across 6 modules |
| Styling | Tailwind CSS v4 | Rapid, consistent UI without hand-rolled CSS |
| Auth | JWT + bcrypt | Stateless auth, standard for SPA + REST API |

This differs from the proposal's suggested PHP/MySQL stack — functionally
equivalent (open-source, zero licensing cost, runs on cheap hosting) but with
stronger typing and a more modern developer experience for the report and demo.

## Project structure

```
club-management-system/
├── backend/           Express API
│   ├── prisma/
│   │   ├── schema.prisma   ← all 6 modules modeled here
│   │   └── seed.ts         ← creates a default admin account
│   └── src/
│       ├── config/         env vars, Prisma client singleton
│       ├── middleware/     auth (JWT), RBAC, error handling
│       ├── modules/
│       │   ├── auth/       register, login, /me
│       │   └── members/    member CRUD, approval, roles
│       └── utils/
└── frontend/          React SPA
    └── src/
        ├── components/     Button, Input, StatusPill, ProtectedRoute
        ├── layouts/         DashboardLayout (role-aware sidebar)
        ├── pages/           Login, Register, Dashboard, Members
        ├── store/           Zustand auth store
        └── lib/             Axios client with JWT interceptor
```

## What's built — all 6 modules complete

- Full database schema for **all 6 modules**: Members, Finance, Events,
  Communication, Reporting/Audit, RBAC
- Working auth: register → pending approval → admin/secretary approves →
  login → JWT session
- Role-based access control (Admin / Treasurer / Secretary / Member) enforced
  on both the API (middleware) and the UI (route gating)
- **Members module**: list, search, filter by status/role, approve
  registrations, promote roles, view a member's profile card
- **Finance module**: fee schedules (dues/levies/event fees), payment
  recording with auto-generated receipt numbers, partial-payment tracking,
  an outstanding-balances (defaulters) view, and a collected-vs-outstanding
  summary — all restricted to Admin/Treasurer, with members only ever able
  to see their own payment history via the API
- **Event management module**: draft → publish → cancel/complete lifecycle,
  capacity-aware RSVP for members, an attendance roster officials can mark
  (attended/absent), and a post-event report form (attendee count, summary,
  challenges, recommendations) that auto-completes the event on submit
- **Communication module**: officials can broadcast an announcement to every
  active member (or a targeted list) in one action; every member gets a
  personal inbox with unread indicators and click-to-read; officials can see
  delivery/read counts for anything they've sent
- **Reporting module**: membership growth over the last 12 months, member
  status breakdown, monthly collections, and event attendance rates — all
  charted with Recharts, pulling live from the data the other five modules
  generate
- Dashboard with live membership stats

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (local install, or a free tier on Supabase/Neon/Railway)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL to your Postgres connection string,
# and JWT_SECRET to a long random string.

npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed        # creates admin@club.local / ChangeMe123!
npm run dev          # starts on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:4000`, so no CORS
config is needed in development.

### 3. First login

Go to `http://localhost:5173/login` and sign in with:
- **Email:** admin@club.local
- **Password:** ChangeMe123!

Change this password immediately in a real deployment — for now, do it by
registering a new admin account manually via Prisma Studio (`npx prisma studio`)
or by adding a "change password" endpoint in Sprint 2.

## Deployment notes (for your report)

- **Backend**: Render, Railway, or Fly.io all have free/cheap tiers that
  support Node + Postgres — good fit for your KES 5,000 hosting budget line.
- **Frontend**: `npm run build` produces a static `dist/` folder that can be
  served from Netlify, Vercel, or the same server as the backend.
- **Database**: Railway/Supabase/Neon all offer a free Postgres instance
  sufficient for a student project's demo and testing phase.
