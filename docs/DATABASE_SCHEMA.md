# Database Schema Documentation

This document mirrors the Prisma schema at `backend/prisma/schema.prisma`. It serves as a human-readable reference for understanding the database structure.

**Note:** If you modify the schema, update this document AND run `npx prisma db push` or `npx prisma migrate dev` to sync changes.

---

## Enums

### Role
| Value | Description |
|-------|-------------|
| `ADMIN` | Full CMS access |
| `EDITOR` | Content editing access |
| `USER` | Default role for registered users |

### PostType
| Value | Description |
|-------|-------------|
| `BLOG` | Standard blog article |
| `RECIPE` | Recipe content type |

### EnrollmentStatus
| Value | Description |
|-------|-------------|
| `PENDING` | Submitted, awaiting confirmation |
| `CONFIRMED` | Approved enrollment |
| `CANCELLED` | Rejected or cancelled |

### OrderStatus
| Value | Description |
|-------|-------------|
| `PENDING` | Created, payment not yet verified |
| `AWAITING_CONFIRM` | Manual transfer proof uploaded, waiting for admin |
| `CONFIRMED` | Paid and verified |
| `REJECTED` | Payment proof rejected |
| `CANCELLED` | Abandoned or cancelled by user/admin |

### ProgramType
| Value | Description |
|-------|-------------|
| `VIDEO_COURSE` | Pre-recorded video content |
| `LIVE_CLASS` | Scheduled live sessions |

### CategoryType
| Value | Description |
|-------|-------------|
| `PROGRAM` | Categories for courses |
| `POST` | Categories for blog posts |

---

## Tables

### 1. User
Admin and registered user accounts.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| email | String | Unique | Login credential |
| password | String | | bcrypt-hashed |
| fullName | String | | |
| role | Role | Default: USER | |
| createdAt | DateTime | | |
| updatedAt | DateTime | | |

---

### 2. Program
Baking courses and class offerings.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| slug | String | Unique | URL-safe identifier |
| title | String | | |
| category | String? | | Category name (denormalized or reference) |
| programType | ProgramType | Default: LIVE_CLASS | |
| description | String? | | |
| price | Int? | | Original price |
| salePrice | Int? | | Discounted price |
| reviews | Int | Default: 0 | |
| students | Int | Default: 0 | |
| thumbnail | String? | | Cloudinary URL |
| authorName | String? | | |
| authorImage | String? | | |
| learningGoals | Json? | | List of goals |
| classIncludes | Json? | | List of items included |
| curriculum | Json? | | Course syllabus |
| premiumContent | Json? | | Private links/docs for enrolled users |
| isFeatured | Boolean | Default: false | Show on homepage |
| chiefId | String? | FK → Chief.id | Linked instructor |
| createdAt | DateTime | | |
| updatedAt | DateTime | | |

---

### 3. ClassSession
Specific instances or schedules of a Program.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| programId | String | FK → Program.id | |
| startDate | DateTime? | | |
| endDate | DateTime? | | |
| enrollmentDeadline | DateTime? | | |
| dayOfWeek | String? | | e.g., "Monday" |
| timeRange | String? | | e.g., "09:00 - 12:00" |
| instructorOverride | String? | | Custom instructor for this session |

---

### 4. Post
Blog articles and recipe content.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| slug | String | Unique | |
| title | String | | |
| content | String | | HTML content |
| desc | String? | | Short summary |
| category | String? | | |
| type | PostType | Default: BLOG | |
| thumbnail | String? | | Cloudinary URL |
| authorId | String? | FK → User.id | |
| authorName | String? | | Fallback author name |
| dateIso | DateTime | | Publication date |
| dateString | String? | | Formatted date |

---

### 5. Chief
Chef/instructor profiles.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| name | String | | |
| role | String | | Title (e.g. Executive Chef) |
| image | String? | | Cloudinary URL |
| bio | String? | | Short bio |
| biography | String? | | Full biography |
| highlights | String? | | Key achievements |
| skills | String? | | Comma-separated skills |
| socialFb | String? | | |
| socialTw | String? | | |
| socialIn | String? | | |

---

### 6. Order
Transactions for course enrollments.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| orderCode | String | Unique | Human-readable ID (e.g. MB1234) |
| userId | String | FK → User.id | |
| programId | String | FK → Program.id | |
| amount | Int | | Final amount paid |
| paymentMethod | String? | | `MANUAL_BANK` or `VNPAY` |
| status | OrderStatus | Default: PENDING | |
| proofImage | String? | | Manual transfer receipt image |
| transactionRef | String? | | Manual transfer reference |
| gatewayTxnRef | String? | | VNPay vnp_TxnRef |
| gatewayTransactionNo | String? | | VNPay transaction ID |
| paidAt | DateTime? | | |

---

### 7. Category
Managed categories for Programs and Posts.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| name | String | | |
| slug | String | | |
| type | CategoryType | Default: PROGRAM | |
| sortOrder | Int | Default: 0 | |
| isActive | Boolean | Default: true | |

---

### 8. Setting
Global application settings (Slider, General Info, etc.).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| key | String | Unique | e.g., `HOME_SLIDER`, `SITE_INFO` |
| value | Json | | Configuration data |

---

### 9. StudentWork
Showcase of student creations.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, UUID | |
| studentName | String | | |
| imageUrl | String | | Cloudinary URL |
| description | String | | |
| programId | String | FK → Program.id | |
| status | String | Default: PENDING | `APPROVED`, `REJECTED` |
