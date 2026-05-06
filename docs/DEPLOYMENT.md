# Deployment Guide

This guide covers how to deploy the Muka Baking CMS. Thanks to the migration to **Cloudinary**, the application is now "stateless," meaning it can be deployed on ephemeral storage platforms like Render, Railway, or traditional VPS.

## Architecture
- **Database**: PostgreSQL (Managed service like Supabase/Neon or installed on VPS).
- **Backend**: Node.js (Express).
- **Frontend**: React (Built to static files).
- **File Storage**: Cloudinary (External).
- **Payments**: VNPay + Manual Bank Transfer.

---

## 1. Environment Variables

You need to configure these variables on your production server:

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@host:port/db?schema=public"
PORT=5000
JWT_SECRET="your-secure-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# VNPay
VNPAY_TMN_CODE="your-tmn-code"
VNPAY_HASH_SECRET="your-hash-secret"
VNPAY_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
VNPAY_RETURN_URL="https://your-domain.com/payment/vnpay-return"

# Frontend URL (for CORS)
FRONTEND_URL="https://your-domain.com"
```

### Frontend (.env.production)
```env
VITE_API_BASE_URL="https://your-api-domain.com/api"
```

---

## 2. Deployment Options

### Option A: PaaS (Render / Railway) — Recommended for ease
1. **Database**: Create a PostgreSQL instance (e.g., on Render or Supabase).
2. **Backend**:
   - Connect your GitHub repo.
   - Build Command: `cd backend && npm install && npx prisma generate`
   - Start Command: `cd backend && node src/index.js`
   - Add Environment Variables.
3. **Frontend (Vercel)**:
   - Connect your GitHub repo.
   - Vercel will automatically detect the root `vercel.json` which handles the subdirectory build.
   - **Root Directory**: Ensure it is set to `.` (the default) because the root `vercel.json` manages the `cd frontend` command.
   - Add Environment Variables.

### Option B: VPS (Ubuntu + NGINX + PM2)
1. Install Node.js, NGINX, and PostgreSQL.
2. Clone repo to `/var/www/muka_baking`.
3. **Backend**: 
   - `npm install`
   - `npx prisma db push`
   - `pm2 start src/index.js --name baking-api`
4. **Frontend**:
   - `npm run build`
   - Configure NGINX to serve `frontend/dist` and proxy `/api` to `localhost:5000`.

---

## 3. Post-Deployment Steps
1. **Seed Data**: Run `node backend/src/seed.js` to populate initial categories and admin user.
2. **Seed Student Works**: To populate or reset only student work data (without affecting programs/users), run:
   ```bash
   cd backend && npm run seed:student-works
   ```
3. **SSL**: Always use HTTPS (Certbot for VPS or automatic for Render).
4. **VNPay White-listing**: Ensure your `VNPAY_RETURN_URL` is registered in the VNPay Merchant Portal.
