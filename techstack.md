# 🥚 Egg Business — Tech Stack Documentation

## 1. Technology Stack Overview

Nee project **full-stack e-commerce + admin management system** kabatti, simple ga maintain cheyyadaniki and future lo scale cheyyadaniki ee stack recommend chestha:

```text
                    EGG BUSINESS
                         │
        ┌────────────────┴────────────────┐
        │                                 │
     CUSTOMER                          ADMIN
        │                                 │
        └────────────────┬────────────────┘
                         │
                  NEXT.JS FRONTEND
                         │
                   REST API / HTTP
                         │
                  NODE.JS + EXPRESS
                         │
                  PRISMA ORM
                         │
                     MYSQL
                         │
                  MYSQL WORKBENCH
```

---

# 2. Complete Tech Stack

| Layer             | Technology              | Purpose                    |
| ----------------- | ----------------------- | -------------------------- |
| Frontend          | Next.js                 | Web application            |
| Language          | TypeScript              | Type-safe development      |
| UI                | React                   | Components                 |
| Styling           | CSS Modules / CSS       | UI styling                 |
| Animation         | Framer Motion           | Smooth animations          |
| Icons             | Lucide React            | Icons                      |
| Forms             | React Hook Form         | Form handling              |
| Validation        | Zod                     | Input validation           |
| API State         | TanStack Query          | Server-state management    |
| Backend           | Node.js                 | Runtime                    |
| API Framework     | Express.js              | REST APIs                  |
| ORM               | Prisma                  | Database access            |
| Database          | MySQL                   | Data storage               |
| DB Tool           | MySQL Workbench         | Database design/management |
| Authentication    | JWT + HTTP-only cookies | Login/session              |
| Password Security | bcrypt                  | Password hashing           |
| Payment           | Razorpay                | Online payments            |
| Image Storage     | Cloudinary              | Product images             |
| Charts            | Recharts                | Admin analytics            |
| Version Control   | Git + GitHub            | Source control             |
| Deployment        | Vercel + Railway/Render | Hosting                    |

---

# 3. Frontend Stack

## Next.js

Use **Next.js with App Router**.

Why:

* React-based
* Routing
* Server Components
* API integration
* SEO
* Image optimization
* Production-ready structure

Main frontend:

```text id="r9w7ks"
Next.js
   │
   ├── Customer Website
   │
   └── Admin Dashboard
```

---

# 4. TypeScript

Use TypeScript throughout frontend and backend.

Example:

```ts id="v7h3e8"
interface Product {
  id: number;
  name: string;
  price: number;
  packSize: number;
  stock: number;
}
```

Benefits:

* Better autocomplete
* Fewer runtime mistakes
* Easier refactoring
* Better API contracts

---

# 5. React

React will be used to create reusable components.

Examples:

```text id="h5x2v1"
ProductCard
Navbar
Footer
CartItem
OrderCard
OrderStatus
AdminTable
DashboardCard
```

Instead of creating the same UI repeatedly, create reusable components.

---

# 6. Styling

Since you prefer avoiding Tailwind, use:

### CSS Modules + Global CSS

Example:

```text id="m0r5z7"
components/
   ProductCard/
      ProductCard.tsx
      ProductCard.module.css
```

Advantages:

* Clean component-level styles
* No huge class strings
* Easy customization
* Good maintainability

---

# 7. Framer Motion

Use Framer Motion for **meaningful animations**, not every element.

Use it for:

* Hero animations
* Product card entrance
* Cart interactions
* Page transitions
* Modal animations
* Order status transitions

Example concept:

```text id="t5l9x0"
Product Added
     ↓
Cart icon animation
     ↓
Toast
"Added to cart ✓"
```

---

# 8. Form Handling

Use:

**React Hook Form**

For:

* Login
* Register
* Address
* Checkout
* Add product
* Edit product
* Profile

Example:

```text id="d7x8l3"
React Hook Form
      ↓
Zod Validation
      ↓
API
```

---

# 9. Validation

Use **Zod**.

Validation should happen on both:

```text id="8s4m1v"
Frontend
   ↓
Zod
   ↓
Backend
   ↓
Zod
```

Frontend validation is for UX.

Backend validation is for security.

---

# 10. API State Management

Use **TanStack Query** for server data.

Examples:

```text id="3q7r8k"
Products
Orders
Customer Profile
Admin Dashboard
Inventory
Analytics
```

Instead of manually managing:

```text
loading
error
data
refetch
```

for every API, TanStack Query can manage server state consistently.

---

# 11. Backend Stack

Recommended backend:

```text id="x6f4c2"
Node.js
   ↓
Express.js
   ↓
REST API
   ↓
Prisma
   ↓
MySQL
```

---

# 12. Node.js

Node.js will run your backend server.

Responsibilities:

* API execution
* Authentication
* Business logic
* Payment processing
* Database communication
* Order processing

---

# 13. Express.js

Express will handle REST APIs.

Example:

```text id="l2v6x9"
GET    /api/products
POST   /api/orders
GET    /api/orders/:id
PATCH  /api/admin/orders/:id/status
```

Backend architecture:

```text id="p5m3v8"
Request
   ↓
Route
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Prisma
   ↓
MySQL
```

---

# 14. Prisma ORM

Use **Prisma** between Node.js and MySQL.

```text id="4m1c9z"
Express
   ↓
Service
   ↓
Prisma
   ↓
MySQL
```

Benefits:

* Type-safe database queries
* Easy relationships
* Migrations
* Schema management
* Better developer experience

MySQL Workbench remains useful for:

* Viewing tables
* Running SQL
* Inspecting data
* Creating EER diagrams
* Database administration

---

# 15. MySQL

MySQL is the primary database.

Database:

```text id="b3z0x8"
egg_business
```

Main tables:

```text id="v1n4j7"
users
addresses
products
inventory
carts
cart_items
orders
order_items
payments
order_status_history
reviews
notifications
```

---

# 16. MySQL Workbench

MySQL Workbench is the **database management/design tool**.

Use it for:

### Database Design

Create the EER diagram.

### SQL

Run queries.

### Data Management

Inspect:

```text
Users
Products
Orders
Payments
Inventory
```

### Debugging

When something goes wrong in the application, you can directly inspect the database.

---

# 17. Authentication

Recommended:

**JWT + HTTP-only cookies**

Flow:

```text id="e4k8n2"
Login
 ↓
Backend verifies credentials
 ↓
Generate session/JWT
 ↓
HTTP-only cookie
 ↓
Browser stores cookie
 ↓
Authenticated API requests
```

Roles:

```text id="w7j3f5"
CUSTOMER
ADMIN
```

---

# 18. Password Security

Never store:

```text id="s9x2a4"
password = "mypassword123"
```

Instead:

```text id="u6k8p1"
password
   ↓
bcrypt
   ↓
password_hash
```

Database stores only the hash.

---

# 19. Payment Technology

Use:

**Razorpay**

Payment flow:

```text id="8k2n4v"
Customer
   ↓
Checkout
   ↓
Backend creates Razorpay order
   ↓
Razorpay Checkout
   ↓
Customer pays
   ↓
Payment response
   ↓
Backend verifies payment
   ↓
MySQL payment record
   ↓
Order confirmed
```

Important:

**Razorpay secret credentials must remain on the backend.**

---

# 20. Image Management

Use:

**Cloudinary**

Product image flow:

```text id="5g8p2c"
Admin
 ↓
Upload Product Image
 ↓
Cloudinary
 ↓
Image URL
 ↓
MySQL
 ↓
Frontend
```

Don't store large image files directly inside MySQL.

Store the Cloudinary URL.

---

# 21. Admin Analytics

Use:

**Recharts**

Display:

```text id="e5m7t2"
Revenue
Orders
Customers
Best-selling Products
```

Example:

```text
Revenue
│
│       ╭───╮
│   ╭───╯   ╰──╮
│───╯          ╰──
└─────────────────
```

The data comes from backend APIs, not directly from MySQL.

---

# 22. API Architecture

Use REST API.

```text id="t4h7k9"
Frontend
   │
   ├── /api/auth
   ├── /api/products
   ├── /api/cart
   ├── /api/orders
   ├── /api/payments
   └── /api/admin
              │
              ▼
          Express
              │
              ▼
            Prisma
              │
              ▼
            MySQL
```

---

# 23. API Communication

Recommended:

```text id="x9c3p7"
Frontend
   ↓
Axios / Fetch
   ↓
REST API
   ↓
Express
```

You can use native `fetch` or Axios. For this project, **native fetch + TanStack Query** is enough and keeps dependencies lower.

---

# 24. Development Tools

Use:

### Code Editor

**Antigravity / VS Code / Cursor**

### Terminal

macOS Terminal

### Database

**MySQL + MySQL Workbench**

### API Testing

**Postman / Insomnia**

### Version Control

**Git**

### Repository

**GitHub**

---

# 25. Git & GitHub

Repository structure:

```text id="k6r8w1"
egg-business/
│
├── frontend/
├── backend/
├── database/
├── docs/
└── README.md
```

Recommended Git workflow:

```text id="h2v7s5"
Development
    ↓
git add
    ↓
git commit
    ↓
git push
    ↓
GitHub
```

---

# 26. Environment Variables

### Frontend

```text id="j4p8q2"
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

### Backend

```text id="q7m2x9"
PORT=
DATABASE_URL=

JWT_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Never commit `.env` files to GitHub.

---

# 27. Local Development Architecture

Your Mac:

```text id="b7m5k3"
                 MacBook
                    │
        ┌───────────┴───────────┐
        │                       │
    Frontend                  Backend
    Next.js                  Node/Express
    :3000                       :5000
        │                       │
        └───────────┬───────────┘
                    │
                  Prisma
                    │
                    ▼
                  MySQL
                  :3306
                    │
                    ▼
             MySQL Workbench
```

---

# 28. Production Architecture

```text id="p8w4c1"
                    INTERNET
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
          Vercel             Railway/Render
          Frontend              Backend
          Next.js              Node.js
                                  │
                                  ▼
                               MySQL
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
                Razorpay                   Cloudinary
```

For production, the MySQL database should be hosted on a managed MySQL provider rather than relying on the MySQL server running on your Mac.

---

# 29. Technology Responsibilities

```text id="q1m6r3"
Next.js
    → Website + Routing + UI

React
    → Components

TypeScript
    → Type Safety

CSS Modules
    → Styling

Framer Motion
    → Animation

TanStack Query
    → Server State

React Hook Form
    → Forms

Zod
    → Validation

Node.js
    → Backend Runtime

Express
    → REST APIs

Prisma
    → Database ORM

MySQL
    → Database

MySQL Workbench
    → Database Management

JWT/Cookies
    → Authentication

bcrypt
    → Password Hashing

Razorpay
    → Payments

Cloudinary
    → Images

Recharts
    → Analytics

Git/GitHub
    → Version Control
```

---

# 30. Final Recommended Stack

### 🖥️ Frontend

**Next.js + TypeScript + React + CSS Modules + Framer Motion + TanStack Query + React Hook Form + Zod**

### ⚙️ Backend

**Node.js + Express.js + TypeScript + Prisma**

### 🗄️ Database

**MySQL + MySQL Workbench**

### 🔐 Authentication

**JWT + HTTP-only Cookies + bcrypt**

### 💳 Payment

**Razorpay**

### ☁️ Storage

**Cloudinary**

### 📊 Analytics

**Recharts**

### 🚀 Deployment

**Vercel + Railway/Render + Managed MySQL**

### 🔧 Development

**Antigravity + Git + GitHub + Postman**

---

## 🔥 Final Architecture

```text id="v4n8q2"
                    🥚 EGG BUSINESS
                           │
                           ▼
                  ┌─────────────────┐
                  │     Next.js     │
                  │   TypeScript    │
                  │     React       │
                  └────────┬────────┘
                           │
                    REST API / HTTP
                           │
                           ▼
                  ┌─────────────────┐
                  │ Node.js +       │
                  │ Express.js      │
                  └────────┬────────┘
                           │
                    Business Logic
                           │
                           ▼
                  ┌─────────────────┐
                  │     Prisma      │
                  │      ORM        │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │      MySQL      │
                  └────────┬────────┘
                           │
                           ▼
                  MySQL Workbench

       ┌──────────────────┼──────────────────┐
       ▼                  ▼                  ▼
   Razorpay           Cloudinary         GitHub
   Payments            Images          Source Code
```

**Core stack:**
**Next.js → Node.js/Express → Prisma → MySQL → MySQL Workbench**, with **Razorpay + Cloudinary** for the external services. This is a very solid stack for your egg-ordering business project.
