# Club Management System

> A full-stack platform for managing club membership, finances, events, communication, and reporting.

The system combines a React frontend with a TypeScript/Express API and PostgreSQL database. It demonstrates authentication, role-based access control, financial workflows, event management, communication, and reporting in one application.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT + bcrypt |
| Charts | Recharts |

## Architecture

```text
React + Vite
     │
     │ REST / API proxy
     ▼
Express + TypeScript
     │
     │ Prisma
     ▼
PostgreSQL
```

## Core Modules

### 👥 Members
- Registration and approval workflow
- Search and filtering
- Member profiles
- Role promotion and status management

### 💰 Finance
- Fee schedules for dues, levies, and events
- Payment recording
- Receipt generation
- Partial-payment tracking
- Outstanding balances
- Collection summaries

### 📅 Events
- Draft, publish, cancel, and complete lifecycle
- Capacity-aware RSVP
- Attendance management
- Post-event reports

### 📣 Communication
- Broadcast announcements
- Targeted messages
- Personal member inbox
- Read/unread indicators
- Delivery and read counts

### 📊 Reporting & Audit
- Membership growth
- Member status breakdown
- Monthly collections
- Event attendance rates
- Audit-oriented workflows

### 🔐 RBAC
Four application roles are supported:

- Admin
- Treasurer
- Secretary
- Member

Authorization is enforced at the API and UI levels.

## Project Structure

```text
club-management-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── modules/
│       └── utils/
└── frontend/
    └── src/
        ├── components/
        ├── layouts/
        ├── pages/
        ├── store/
        └── lib/
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

The API runs on port `4000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on port `5173` by default.

> **Security:** This repository intentionally does not publish login credentials. Create your own local development account and use environment variables for secrets. Never commit real passwords, JWT secrets, or database credentials.

## Project Status

The core six-module architecture and application workflows are implemented. Further production hardening, automated test coverage, deployment configuration, and additional UX refinement remain on the roadmap.

## Developer

**James Kelvin** — Software developer focused on full-stack applications, business systems, and security-conscious engineering.

[GitHub](https://github.com/JKELVIN-tech)
