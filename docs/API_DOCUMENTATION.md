# API Documentation — Muka Baking CMS

Base URL: `http://localhost:5000/api`

All protected endpoints require the header: `Authorization: Bearer <valid_jwt_token>` (Note: some legacy endpoints might still use `x-auth-token`).

---

## 1. Authentication

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|-------------|----------|
| POST | `/auth/register` | No | `{ email, password, fullName }` | `{ token, user }` |
| POST | `/auth/login` | No | `{ email, password }` | `{ token, user }` |
| GET | `/auth/me` | Yes | — | `{ id, email, fullName, role }` |
| POST | `/auth/refresh` | No | `{ refreshToken }` | `{ token }` (access token) |
| POST | `/auth/logout` | No | `{ refreshToken }` | Logout and invalidate session |

---

## 2. Programs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/programs` | No | List all programs (supports query params for filtering) |
| GET | `/programs/:slug` | No | Get single program by slug |
| POST | `/programs` | Yes | Create a program |
| PUT | `/programs/:id` | Yes | Update a program |
| DELETE | `/programs/:id` | Yes | Delete a program |

**New Fields:** `salePrice`, `programType`, `learningGoals`, `classIncludes`, `curriculum`, `premiumContent`, `isFeatured`.

---

## 3. Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | No | List all active categories |
| GET | `/categories/admin` | Yes | List all categories for management |
| POST | `/categories` | Yes | Create a category |
| PUT | `/categories/:id` | Yes | Update a category |
| DELETE | `/categories/:id` | Yes | Delete a category |

---

## 4. Orders & Payments

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | Yes | Create a new order |
| GET | `/orders/my-orders` | Yes | List orders for the current user |
| GET | `/orders/:id` | Yes | Get order details |
| PATCH | `/orders/:id/proof` | Yes | Upload manual payment proof |
| GET | `/orders` | Yes (Admin) | List all orders |
| PATCH | `/orders/:id/status` | Yes (Admin) | Update order status |

### VNPay Integration
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/vnpay/create-payment-url` | Yes | Generate VNPay redirect URL for an order |
| GET | `/vnpay/return` | No | VNPay return URL (UI landing) |
| GET | `/vnpay/ipn` | No | VNPay IPN URL (Server-to-server) |

---

## 5. File Upload (Cloudinary)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload` | Yes | Upload image file to Cloudinary |

**Request:** `multipart/form-data` with field name `image`  
**Response:** `{ url: "https://res.cloudinary.com/..." }`

---

## 6. Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/settings/:key` | No | Get setting value by key (e.g., `HOME_SLIDER`) |
| POST | `/settings` | Yes | Update or create a setting |

---

## 7. Student Work

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/student-work` | No | List approved student works |
| POST | `/student-work` | Yes | Submit student work |
| GET | `/student-work/admin` | Yes | List all for moderation |
| PATCH | `/student-work/:id/status` | Yes | Approve/Reject work |

---

## 8. Stats (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stats/dashboard` | Yes | Get overview statistics (revenue, orders, students) |

---

## 9. Contacts & Feedback

| Method | Endpoint | Auth | Request Body | Description |
|--------|----------|------|--------------|-------------|
| POST | `/contacts` | No | `{ email, fullName?, subject?, message? }` | Submit contact form or newsletter registration. Only `email` is strictly required. |
| GET | `/contacts` | Yes (Admin) | — | List all contact submissions |
| DELETE | `/contacts/:id` | Yes (Admin) | — | Delete a submission |

---

## 10. Legacy / Public Modules
- **Chiefs**: `GET /chiefs`
- **Testimonials**: `GET /testimonials`
- **Enrollments**: Legacy course signup (replaced by Orders flow but still active)
