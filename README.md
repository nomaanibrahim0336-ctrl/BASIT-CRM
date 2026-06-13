# Graphic Business CRM

Full-stack operations dashboard for a graphic design selling agency, built with Next.js 14 (App Router), Supabase, Prisma, and Tailwind CSS / shadcn/ui.

## Development Phases

This project is being built in phases:

1. **Phase 1 — Frontend** (Steps 1-8): Project scaffold, auth, dashboard, leads, deals, design queue, finances, team
2. **Phase 2 — Backend** (Steps 9-13): Prisma schema, RLS policies, Google Sheets sync, P&L engine, API routes
3. **Phase 3 — Deployment** (Steps 14-16): GitHub, Supabase, Vercel

## Getting Started

```bash
npm install
cp .env.example .env.local
# fill in .env.local with your Supabase / Google credentials
npx prisma generate
npm run dev
```

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (Discord-inspired dark theme)
- Supabase (PostgreSQL + Auth)
- Prisma ORM
- React Query, react-hook-form + zod, Recharts, @hello-pangea/dnd
- Google Sheets API integration for merchant data sync
- Vercel hosting + cron jobs
