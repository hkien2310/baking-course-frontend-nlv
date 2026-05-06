# Muka Baking Course — Project Overview

## 1. What This Project Is

This is a **full-stack web application** built by converting a premium static HTML/CSS/jQuery template ("Muka — Bakery and Cooking Classes") into a dynamic, database-driven platform with a custom CMS. The original template source lives in `/themeforest-5aMLDH4E-muka-bakery-and-cooking-classes-html-template/` and serves as the design reference for all public-facing pages.

The system consists of two independent codebases that communicate over REST APIs:

| Layer | Location | Purpose |
|-------|----------|---------|
| **Frontend** | `/frontend/` | React 18 (Vite) SPA serving the public website and Admin CMS dashboard |
| **Backend** | `/backend/` | Node.js / Express API server with Prisma ORM and PostgreSQL |

## 2. Technology Stack

| Concerns | Technology | Notes |
|---------|-----------|-------|
| Frontend Framework | React 18 + Vite | Fast HMR, ESM-based bundler |
| Routing | React Router DOM v6 | Nested layouts, protected routes |
| HTTP Client | Axios | Interceptor auto-attaches JWT token |
| Styling | **Vanilla CSS only** | TailwindCSS is **strictly prohibited** |
| Backend Runtime | Node.js + Express.js | Port 5000 |
| ORM | Prisma | Source of truth: `prisma/schema.prisma` |
| Database | PostgreSQL | Local DB name: `muka_baking_db` |
| Authentication | JWT + bcrypt | Token-based |
| File Uploads | **Cloudinary** | Stateless storage, no local disk dependency |
| Payments | **VNPay** + Bank | Integrated payment gateway |

## 3. Directory Architecture

```
baking/
├── frontend/                       # React SPA
│   ├── public/                     # Static assets from the original HTML template (vendor JS, CSS, images)
│   ├── index.html                  # Entry HTML — loads legacy <script> and <link> tags from /public
│   └── src/
│       ├── App.jsx                 # Root router — all route definitions live here
│       ├── main.jsx                # React DOM render entry point
│       ├── constants/routes.js     # CENTRALIZED route path constants (prevents broken links)
│       ├── services/api.js         # Axios instance + all API call functions
│       ├── config/siteConfig.js    # Static site metadata (menu items, sidebar categories)
│       ├── data/mockData.js        # Legacy mock data (kept for reference, no longer used)
│       ├── hooks/                  # Custom React hooks (e.g., useTemplateRuntime)
│       ├── layouts/
│       │   └── PublicLayout.jsx    # Wraps Header + <Outlet> + Footer for all public pages
│       ├── pages/                  # Route-level components:
│       │   ├── Home.jsx            #   / (homepage)
│       │   ├── About.jsx           #   /about
│       │   ├── Program.jsx         #   /program (list of all courses)
│       │   ├── ProgramDetail.jsx   #   /program/:slug (single course view)
│       │   ├── Receipt.jsx         #   /receipt (blog listing page)
│       │   ├── PostDetail.jsx      #   /post/:slug (single blog post)
│       │   ├── Contact.jsx         #   /contact
│       │   ├── ChiefDetail.jsx     #   /chief/:id (single chef profile)
│       │   ├── Auth.jsx            #   /auth (login/register)
│       │   ├── UserDashboard.jsx   #   /my-account (protected)
│       │   ├── AdminDashboard.jsx  #   /admin (protected, requires ADMIN role)
│       │   └── NotFound.jsx        #   * (404 catch-all)
│       └── components/
│           ├── Header/Header.jsx   # Site-wide navigation bar
│           ├── Footer/Footer.jsx   # Site-wide footer
│           ├── Home/               # Homepage section blocks (Slider, Classes, Blog, etc.)
│           ├── Blog/               # BlogCard.jsx, BlogSidebar.jsx
│           ├── Contact/            # ContactForm.jsx
│           ├── Admin/              # CMS table components (AdminPrograms, AdminPosts, etc.)
│           ├── Auth/               # ProtectedRoute.jsx
│           └── Shared/             # ProgramCard.jsx, PageTitle.jsx, ScrollToTop.jsx
│
├── backend/                        # Node.js API Server
│   ├── prisma/
│   │   └── schema.prisma           # DATABASE SCHEMA — the single source of truth for all tables
│   ├── src/
│   │   ├── index.js                # Express server initialization + route registration
│   │   ├── seed.js                 # Populates DB with initial data + creates admin account
│   │   ├── seedAdmin.js            # Standalone admin account creation script
│   │   ├── controllers/            # Business logic for each entity
│   │   ├── routes/                 # Express router definitions
│   │   ├── middleware/             # authMiddleware.js (JWT verification)
│   │   └── middlewares/            # Additional middleware layer
│   └── uploads/                    # (Legacy) Disk storage for uploaded images
│
├── docs/                           # Project documentation
│   ├── PROJECT_OVERVIEW.md         # This file — start here
│   ├── DATABASE_SCHEMA.md          # Human-readable table definitions
│   ├── API_DOCUMENTATION.md        # REST endpoint reference
│   ├── MASTER_PLAN.md              # High-level project roadmap (legacy)
│   └── plans/                      # Per-phase execution history (phase_1.md through phase_9.md)
│
└── themeforest-5aMLDH4E-.../       # Original HTML template (reference only, not served)
    └── HTML/                       # Source .html files used as visual design targets
```

## 4. Project History — Completed Phases

### Phase 1: Component Extraction
Converted the monolithic HTML template files into modular React components. All original CSS class names were preserved to maintain visual compatibility with the template's jQuery plugins and Bootstrap grid. Created `mockData.js` to power the UI during development before the backend existed.

### Phase 2: Backend Foundation
Bootstrapped the Node.js/Express server. Designed the Prisma schema by analyzing the HTML template's data structures. Created `seed.js` to populate the database with content extracted from the original HTML files. Established the default admin account (`admin@muka.com` / `admin123`).

### Phase 3: Authentication & Security
Implemented JWT-based authentication. Login endpoint at `POST /api/auth/login` returns a signed token. Created `authMiddleware.js` that intercepts all mutating requests (`POST`, `PUT`, `DELETE`) and rejects them with `401 Unauthorized` unless a valid `Authorization: Bearer <token>` header is present. Exception: `POST /api/contacts` and `POST /api/enrollments` are public (anyone can submit forms).

### Phase 4: Admin CMS Dashboard
Built a custom dark-mode admin interface at `/admin`. The Admin Dashboard uses a tab-based sidebar to switch between entity management views (Programs, Posts, Sliders, Timetables, Contacts, Enrollments). CSS isolation is achieved by injecting an `.admin-mode` class onto `<body>` via `useEffect` — all admin-specific styles are scoped under this class to prevent bleeding into public pages.

### Phase 5: Live Data Integration
Replaced all static mock data with live API calls. Every page component now fetches data from the backend via Axios on mount using `useEffect`. The Axios instance in `services/api.js` automatically attaches the JWT token from `localStorage` to every request via an interceptor.

### Phase 6: Dynamic Detail Pages
Built three detail page components that accept URL parameters:
- `ProgramDetail.jsx` — fetches by `:slug` via `GET /api/programs/:slug`
- `PostDetail.jsx` — fetches by `:slug` via `GET /api/posts/:slug`
- `ChiefDetail.jsx` — fetches by `:id` via `GET /api/chiefs/:id`

### Phase 7: Full CRUD & File Uploads
Implemented complete Create/Read/Update/Delete operations for all entities through the Admin CMS. Built reusable `AdminTable.jsx` and `AdminModal.jsx` components. Configured Multer on the backend to handle image uploads via `POST /api/upload`.

### Phase 8: CRM — Contacts & Enrollments
Added two new database tables (`Contact`, `Enrollment`) with corresponding API endpoints. Public users can submit contact messages and enrollment requests. Admin dashboard gained two new management modules: an Inbox for contact messages and an Enrollment tracker with status toggling (`PENDING` → `CONFIRMED`).

### Phase 9: SPA Navigation Polish
Fixed critical SPA navigation issues:
- **ScrollToTop hook**: Forces `window.scrollTo(0, 0)` and dispatches a fake `resize` event on every route change.
- **Centralized route constants**: All URL paths moved to `constants/routes.js`.
- **404 fallback**: A `NotFound.jsx` page is registered at `path="*"` to catch invalid URLs.

### Phase 10: Cloudinary Migration
Replaced local disk storage (`/backend/uploads/`) with **Cloudinary**. This transition makes the backend "stateless," allowing for easy deployment on ephemeral platforms like Render or Vercel without risking data loss during server restarts. All image uploads now return persistent URLs hosted on Cloudinary's CDN.

### Phase 11: VNPay Payment Integration
Integrated **VNPay** as the primary automated payment gateway.
- **Backend**: Created a dedicated VNPay module with secure hash signing, return URL handling, and IPN (Instant Payment Notification) verification.
- **Frontend**: Added a full checkout flow including payment method selection, redirect to VNPay, and a dedicated `PaymentResult.jsx` page to handle callback responses.
- **Order Tracking**: Expanded the `Order` model to track gateway transaction IDs, response codes, and payment timestamps.

## 5. Critical Architectural Decisions (Must-Know for New Developers)

### A. No TailwindCSS — Ever
The original theme relies on thousands of lines of custom CSS with class names like `.ls`, `.ds`, `.vertical-item`, `.s-py-100`. TailwindCSS would conflict with these. All styling must use the existing CSS classes or add new ones in `App.css`.

### B. CSS Isolation for Admin Dashboard
The admin dashboard lives at `/admin` and has its own dark-mode styling. To prevent style conflicts:
- `AdminDashboard.jsx` adds `document.body.classList.add('admin-mode')` on mount
- All admin CSS rules are scoped: `.admin-mode .some-class { ... }`
- On unmount, the class is removed: `document.body.classList.remove('admin-mode')`

### C. jQuery Compatibility
The template's `main.js` measures header height on `DOMContentLoaded` and `window.load`. React SPA transitions don't trigger these events. The `<ScrollToTop />` component works around this by dispatching `window.dispatchEvent(new Event('resize'))` after each navigation, which forces the template JS to recalculate.

### D. Route Management
**Never hardcode URLs.** Always import from `constants/routes.js`:
```js
import { ROUTES } from '../constants/routes';
// Use: <Link to={ROUTES.PROGRAM_DETAIL(slug)}> instead of <Link to={`/program/${slug}`}>
```

### E. API Token Flow
The frontend stores the JWT in `localStorage` under the key `token`. The Axios interceptor in `services/api.js` reads it and attaches it as `Authorization: Bearer <token>` header (or legacy `x-auth-token`).

## 6. How to Run the Project

### Backend
```bash
cd backend
npm install
# Create .env with DATABASE_URL, PORT, JWT_SECRET, CLOUDINARY_*, VNPAY_*
npx prisma db push        # Sync schema to PostgreSQL
node src/seed.js           # Seed initial data + admin account
npm run dev                # Starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                # Starts on http://localhost:5173
```

### Default Admin Credentials
- Email: `admin@muka.com`
- Password: `admin123`

## 7. Upcoming Work (Phase 12+)

| Task | Description | Scope |
|------|-------------|-------|
| Docker | Containerize backend for deployment | Backend |
| Input Validation | Add `zod` or `Joi` to all API endpoints | Backend |
| E2E Testing | Playwright test suite for critical user flows | Frontend |
| SEO Optimization | Meta tags and SSR considerations | Frontend |
| Mobile App | React Native or Flutter companion app | Mobile |
| Analytics | Integrated dashboard for sales and traffic | Admin |

## 8. Engineering Standards

1. **Schema is source of truth.** Any database change starts in `prisma/schema.prisma`, then gets documented in `DATABASE_SCHEMA.md`.
2. **API changes get documented.** New or modified endpoints must be recorded in `API_DOCUMENTATION.md`.
3. **CSS class names are sacred.** The original template's class names must never be renamed or removed.
4. **Backend before Frontend.** Complete and test API endpoints before building the corresponding UI.
5. **Use `<Link>`, never `<a>`.** All internal navigation must use React Router's `<Link>` component with `ROUTES` constants.
