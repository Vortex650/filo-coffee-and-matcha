# Architecture

## Monorepo
- `frontend/` — React 19 + Vite + TS + Tailwind 4 + Flowbite React + React Router v7 + Framer Motion + Axios + RHF + Zod + React Icons + Recharts
- `backend/` — Django 6 + DRF + PostgreSQL (Supabase) + SimpleJWT + django-cors-headers + django-filter + drf-spectacular
- `docs/`

## Backend apps (Phase 1)
- `core` — business settings, audit log, health check
- `accounts` — custom User, roles, auth endpoints
- `menu` — categories, products, sizes, addons
- `orders` — orders, order items, status transitions
- `payments` — payment methods config, verification

## API
REST under `/api/v1/`. JWT bearer auth. Public: menu, business settings, order creation, order tracking by code. Staff: order management, payment verification. Admin: menu CRUD, settings, users.

## Auth
SimpleJWT (access + refresh). Roles: owner, manager, cashier, barista, customer. Backend-enforced permissions.

## Database
PostgreSQL via `DATABASE_URL` env (Supabase). SQLite fallback for local dev.

## Deployment
- Frontend: Vercel (project filo-coffee-and-matcha)
- Backend: Render (service filo-coffee-api)
- DB: Supabase (project filo-coffee-and-matcha, db filo_coffee_db)
- Local DB admin: pgAdmin 4
