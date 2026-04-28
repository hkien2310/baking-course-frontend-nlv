# HANDOVER.md

## Project Overview

This project is the **Baking Course** platform, currently prepared for public client testing on a free staging stack.

Architecture:
- **Frontend**: React + Vite
- **Backend**: Express + Prisma
- **Database**: PostgreSQL

Current staging deployment:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Neon Postgres

---

## Repository Structure

Project root:
- `frontend/` → Vite React application
- `backend/` → Express API, Prisma schema, uploads handling, payment routes

Important local paths used during work:
- Project root: `/Users/hoangkien/NLV/baking`
- Frontend: `/Users/hoangkien/NLV/baking/frontend`
- Backend: `/Users/hoangkien/NLV/baking/backend`

---

## Current Branch and Deployment Sources

Working branch for staging and recent fixes:
- `dev/kien`

Git remotes used:
- Main origin: `https://github.com/ocanhdt12-gif/baking-course-frontend.git`
- Vercel-connected fork: `https://github.com/hkien2310/baking-course-frontend-nlv.git`

Staging services:
- Frontend URL: `https://baking-course-frontend-nlv.vercel.app`
- Backend URL: `https://baking-backend-staging.onrender.com`

---

## Current Staging Accounts

Seeded accounts on staging:
- Admin: `admin@baking.com` / `Admin123!`
- User: `user@baking.com` / `User123!`

---

## Key Technical Decisions

### 1. Relative image paths
The API/database should return **relative image paths**, not absolute host URLs.

Examples:
- `/uploads/...`
- `/images/...`

Frontend is responsible for resolving the final usable image URL.

Why this matters:
- staging host can change
- future client host can change
- no mass DB rewrite required during migration

### 2. Staging stack choice
Vercel + Render + Neon was chosen because backend includes:
- uploads
- cron-like behavior
- payment/webhook logic
- Prisma + Postgres

So full-Vercel deployment was not appropriate.

### 3. Admin loading strategy
Admin loading was reworked to:
- use shared admin-only skeleton/loading patterns
- avoid app-wide loading bleed into public pages
- include pending states for CRUD actions

### 4. Social icon handling
Public social icons were standardized, including a custom TikTok SVG instead of relying only on older Font Awesome fallback classes.

---

## Important Environment Notes

### Backend local env trap
Local backend `.env` points to localhost Postgres.

Current known local pattern:
- backend `.env` uses local DB
- staging DB uses Neon

Important rule:
**Any staging DB script must explicitly pass the Neon `DATABASE_URL`, or it may hit localhost by mistake.**

### Frontend env
Staging frontend uses:
- `VITE_API_BASE_URL=https://baking-backend-staging.onrender.com/api`

---

## Data and Content State

### Seeded / prepared on staging
- admin user
- normal user
- programs
- program categories
- normalized image references

### Important reminder
Database is not the only source of truth.

Operational content lives in two places:
1. **Postgres database**
2. **uploaded files** in backend storage

If you move only the DB and forget uploads, image/file paths may remain in records but the actual files will be missing.

---

## Uploads and Static Assets

Two classes of images/files exist:

### 1. Public static assets
Usually in frontend public assets, example:
- `/images/...`

These are deployed with frontend.

### 2. Runtime uploaded files
Usually served from backend, example:
- `/uploads/...`

These must be backed up and migrated separately.

---

## Recent Major Frontend Improvements

Recent work included:
- fixing Vercel SPA rewrites for direct routes like `/admin`
- removing old baked-in `/baking/` root assumptions in Vite config
- centralizing image URL resolution
- normalizing staging image paths
- unifying admin loading states
- adding per-action pending states in admin
- scoping config-loading behavior to avoid global blocking
- improving social icon consistency and TikTok rendering
- replacing several public/auth loading text fallbacks with shared loading UI
- gating preloader shutdown on `siteConfig` readiness

---

## Known Risk Areas

### 1. Route transition behavior
There have been UX issues around transitions between public pages and admin pages, especially during auth/layout changes.
This area should be regression-tested after any layout/router refactor.

### 2. Uploaded file migration
The biggest operational risk during hosting migration is incomplete file transfer.

### 3. Environment mismatch
Backend and frontend env values must match the target host, especially:
- `DATABASE_URL`
- `FRONTEND_URL`
- payment callback URLs
- API base URL

---

## Recommended Verification Checklist

After any deployment, verify:
- homepage loads
- direct routes work (`/admin`, detail pages, etc.)
- login works for admin and user
- image rendering works on homepage, posts, programs, instructors
- admin settings save correctly
- uploads still display
- order/payment-related screens do not break
- site config values render in header/footer/contact

---

## Recommended Next Docs

This handover should be used together with:
- `CLIENT_HOST_MIGRATION_PLAN.md`

That file focuses specifically on safe migration to the client's host.
