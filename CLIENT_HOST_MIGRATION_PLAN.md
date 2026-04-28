# CLIENT_HOST_MIGRATION_PLAN.md

## Objective

Move the project from the current staging/free-host setup to the client's hosting environment **without losing data** and without breaking image/file references.

This migration is successful only if the following are moved together:
- database
- uploads/files
- backend environment config
- frontend environment config
- domain/callback configuration

---

## Current Hosting Layout

Current stack:
- Frontend: Vercel
- Backend: Render
- Database: Neon Postgres

Target stack:
- Client-hosted frontend
- Client-hosted backend
- Client-hosted or client-owned PostgreSQL

---

## Critical Migration Principle

**Database and uploaded files must be migrated from the same cutover window.**

If DB and uploads are copied at different times while users/admins are still making changes, records may point to files that do not exist on the new host.

Examples of bad outcomes:
- DB record contains `/uploads/proof-123.jpg` but file was never copied
- file exists on new host but DB dump was taken before the record was created

---

## What Must Be Migrated

### 1. Database
Includes at minimum:
- users
- programs
- categories
- posts
- testimonials
- contacts
- enrollments
- orders
- payment config
- site config
- any Prisma-managed relational data

### 2. Uploaded files
Anything served from backend uploads, for example:
- course thumbnails uploaded through admin
- post images uploaded through admin
- payment proof files
- other runtime-uploaded media

### 3. Environment configuration
Backend env examples:
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `PORT`
- mail config if used
- payment config if used
- VNPay config if enabled later

Frontend env examples:
- `VITE_API_BASE_URL`

### 4. Domain and callback configuration
Examples:
- `www.client-domain.com`
- `api.client-domain.com`
- payment return URL
- webhook/callback allowlists
- CORS origins

---

## Recommended Migration Strategy

## Phase 1. Prepare the client environment

Before moving data:
- provision client PostgreSQL
- deploy backend code to client host
- deploy frontend code to client host or staging subdomain
- prepare uploads storage path on the backend host
- configure env values on the new host

Do **not** cut traffic yet.

---

## Phase 2. Prepare for cutover

### Freeze write activity
For safest migration, temporarily prevent new writes during final migration window.

Options:
- enable maintenance mode
- temporarily disable admin writes
- schedule migration during low-traffic time

Goal:
- avoid new orders/uploads/settings changes during final export/import window

---

## Phase 3. Back up database

Recommended PostgreSQL export example:

```bash
pg_dump --clean --if-exists --no-owner --no-privileges "$OLD_DATABASE_URL" > backup.sql
```

If a compressed dump is preferred:

```bash
pg_dump -Fc "$OLD_DATABASE_URL" > backup.dump
```

Keep the backup file until production validation is complete.

---

## Phase 4. Back up uploads

If uploads are stored locally on backend disk, back them up separately.

Example:

```bash
tar -czf uploads-backup.tar.gz backend/uploads
```

Or if copying between servers:

```bash
rsync -av backend/uploads/ user@new-server:/path/to/backend/uploads/
```

This step is mandatory.

---

## Phase 5. Restore database on client host

Example using SQL dump:

```bash
psql "$NEW_DATABASE_URL" < backup.sql
```

If using Prisma migrations after provisioning a clean DB:
- schema can be initialized with `prisma migrate deploy`
- but for a full production/staging move, a DB restore is usually more complete and safer than reseeding

---

## Phase 6. Restore uploads on client host

Make sure files end up in the correct backend location.

Important:
- backend must continue serving the same route pattern
- example: `/uploads/...`

If DB records store relative paths like `/uploads/abc.jpg`, the new backend must expose those paths unchanged.

---

## Phase 7. Configure backend on client host

Verify:
- DB connection works
- uploads directory exists and is readable
- static serving for uploads works
- CORS is updated for the new frontend domain
- secrets and payment env values are configured

Recommended checks:
- backend health route or base API responds
- fetch a known program/post with image fields
- open an uploaded file URL directly

---

## Phase 8. Configure frontend on client host

Set:
- `VITE_API_BASE_URL=https://api.client-domain.com/api`

Then build/deploy frontend.

Recommended domain split:
- `www.client-domain.com` → frontend
- `api.client-domain.com` → backend

This keeps deployment cleaner and makes future debugging easier.

---

## Phase 9. Verify data integrity before DNS cutover

Do not switch live traffic before these checks pass.

### Database verification
Check record counts for key tables:
- users
- programs
- categories
- posts
- testimonials
- contacts
- enrollments
- orders
- settings/config tables

### File verification
Check:
- uploaded images render
- payment proof files open
- representative samples from old content still work
- no 404 on upload-backed assets

### Functional verification
Check:
- admin login works
- normal user login works
- homepage renders with site config
- post detail works
- program detail works
- admin edit forms load old content correctly
- new upload works on the new host
- save site config works

---

## Phase 10. Cutover

Once verification passes:
- update DNS/domain routing
- switch frontend to client domain
- switch backend/API domain if needed
- update payment callback URLs
- confirm SSL certificates are valid

---

## Phase 11. Post-cutover monitoring

For at least 24 to 48 hours, monitor:
- login failures
- missing image reports
- upload failures
- order/payment issues
- admin save failures
- CORS or mixed-domain errors

Do not delete old host backups immediately.

---

## Failure Rollback Plan

If the new host fails after cutover:
1. keep old environment intact until signoff
2. revert DNS if necessary
3. restore old frontend/backend routing
4. investigate before retrying migration

This is why old DB and uploads should not be destroyed right after cutover.

---

## Project-Specific Notes for This Repository

### Relative image path design is good
This project intentionally uses relative image paths in API/DB.

That means migration is easier because DB records do not hardcode old staging hostnames.

### Public images vs uploads
- `/images/...` usually come from frontend static assets
- `/uploads/...` usually come from backend runtime storage

Both must continue working after migration.

### Local env trap
Local backend `.env` may point to localhost database.

Therefore:
- when running any staging/prod migration script
- always pass the intended `DATABASE_URL` explicitly

Do not assume local `.env` is safe.

---

## Final Success Criteria

The migration is complete only when:
- all DB records are present
- all upload-backed assets are present
- frontend points to the correct backend
- admin can edit existing content
- newly uploaded files work on the new host
- no broken paths remain from the old environment

---

## Recommended Future Improvement

Before the real client migration, prepare:
- one backup script for DB
- one backup script for uploads
- one restore checklist
- one verification checklist
- one cutover runbook

This will reduce migration risk significantly.
