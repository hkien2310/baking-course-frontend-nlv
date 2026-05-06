# Muka Baking CMS — Full-Stack Cooking Classes Platform

A production-ready, full-stack application built for a culinary and baking academy. Features a public-facing website and a custom secure Admin CMS to manage courses, chefs, blogs, and enrollments.

## 🏗 Architecture

The project is structured as a decoupled monorepo:

- **Frontend (`/frontend`)**: React 18 Single Page Application (SPA) compiled with Vite. Handles both the public website and the `/admin` CMS dashboard. No TailwindCSS is used; styling is preserved from a premium HTML template.
- **Backend (`/backend`)**: Node.js / Express API server with PostgreSQL database (managed via Prisma ORM). Uses **Cloudinary** for stateless file storage and **VNPay** for automated payments.

## 🚀 Quick Start

### 1. Database & Backend
Ensure you have PostgreSQL installed or use a cloud database.
```bash
cd backend
npm install

# Setup env variables
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, CLOUDINARY_*, VNPAY_*

# Push schema and seed initial data
npx prisma db push
node src/seed.js

# Start server
npm run dev
```


### 2. Frontend
```bash
cd frontend
npm install

# Start Vite dev server
npm run dev
```

## 📖 Documentation Index

Detailed documentation exists within the `/docs` folder:

- [Project Overview](./docs/PROJECT_OVERVIEW.md) - Architecture and History
- [Database Schema](./docs/DATABASE_SCHEMA.md) - Tables, Enums, and Relationships
- [API Documentation](./docs/API_DOCUMENTATION.md) - REST Endpoints and Auth
- [Admin Manual (CMS)](./docs/ADMIN_MANUAL.md) - Guide for End-Users
- [Deployment Guide](./docs/DEPLOYMENT.md) - How to ship to production

## 🔐 Default Admin Account
For local testing, the `seed.js` script generates a default admin account. Please change this in production:
- **Email:** `admin@baking.com`
- **Password:** `Admin123!`
