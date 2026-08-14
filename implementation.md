 🥚 Egg Business — Implementation Documentation

This document explains how to actually build the project, from creating the MySQL database to connecting the customer website, backend, and admin dashboard.


---

1. Project Objective

The system is an online egg ordering and management platform.

Customer

Visit Website
     ↓
Browse Eggs
     ↓
Select Product
     ↓
Add to Cart
     ↓
Login/Register
     ↓
Select Address
     ↓
Choose Payment
     ↓
Place Order
     ↓
Track Order

Admin

Admin Login
     ↓
Dashboard
     ↓
View Orders
     ↓
Manage Products
     ↓
Manage Inventory
     ↓
Update Order Status
     ↓
View Customers
     ↓
View Revenue / Analytics


---

2. Implementation Stack

Frontend
Next.js
TypeScript
React
CSS Modules
Framer Motion
TanStack Query
React Hook Form
Zod

Backend
Node.js
Express.js
TypeScript
Prisma

Database
MySQL
MySQL Workbench

Services
Razorpay
Cloudinary

Development
Git
GitHub
Postman


---

3. Project Structure

Create the project like this:

egg-business/
│
├── frontend/
│
├── backend/
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── README.md
│
├── docs/
│   ├── PRD.md
│   ├── APP_FLOW.md
│   ├── FRONTEND.md
│   ├── BACKEND.md
│   ├── TECH_STACK.md
│   └── IMPLEMENTATION.md
│
├── .gitignore
└── README.md


---

4. Phase 1 — Create MySQL Database

Open MySQL Workbench.

Create database:

CREATE DATABASE egg_business;

Select it:

USE egg_business;

Then create:

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


---

5. Database Implementation Order

Don't create tables randomly.

Follow this order:

1. users
       ↓
2. addresses
       ↓
3. products
       ↓
4. inventory
       ↓
5. carts
       ↓
6. cart_items
       ↓
7. orders
       ↓
8. order_items
       ↓
9. payments
       ↓
10. order_status_history
       ↓
11. reviews
       ↓
12. notifications

This makes foreign-key relationships easier.


---

6. Insert Initial Admin

After creating users, create your admin account.

For example:

INSERT INTO users
(name, email, phone, password_hash, role)
VALUES
(
    'Admin',
    'admin@eggstore.com',
    '9999999999',
    'TEMP_HASH',
    'ADMIN'
);

⚠️ In the real application, don't manually store a plain password. The backend should hash the password with bcrypt.


---

7. Phase 2 — Backend Setup

Go into backend:

cd egg-business
mkdir backend
cd backend

Initialize:

npm init -y

Install:

npm install express cors dotenv bcrypt jsonwebtoken cookie-parser zod

Install Prisma:

npm install prisma @prisma/client

Development tools:

npm install -D typescript tsx @types/node @types/express @types/cookie-parser

Initialize TypeScript:

npx tsc --init

Initialize Prisma:

npx prisma init


---

8. Backend Environment

Create:

backend/.env

Example:

PORT=5000

DATABASE_URL="mysql://USERNAME:PASSWORD@localhost:3306/egg_business"

JWT_SECRET="your-super-secret-key"

RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

Don't upload this file to GitHub.


---

9. Prisma Configuration

Your Prisma schema should represent the MySQL tables.

Architecture:

schema.prisma
      ↓
Prisma Client
      ↓
MySQL

After defining the schema:

npx prisma generate

If Prisma is responsible for creating/migrating the database schema:

npx prisma migrate dev --name init

Then inspect:

npx prisma studio


---

10. Backend Folder Structure

backend/
│
├── src/
│   ├── config/
│   │   └── env.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── order.controller.ts
│   │   ├── payment.controller.ts
│   │   └── admin.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts
│   │   └── inventory.service.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── order.routes.ts
│   │   ├── payment.routes.ts
│   │   └── admin.routes.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── validators/
│   │   ├── auth.schema.ts
│   │   ├── product.schema.ts
│   │   └── order.schema.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── razorpay.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   └── schema.prisma
│
├── .env
├── package.json
└── tsconfig.json


---

11. Backend Request Architecture

Every request should follow:

Client
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

Example:

GET /api/products
        ↓
product.routes.ts
        ↓
product.controller.ts
        ↓
product.service.ts
        ↓
Prisma
        ↓
MySQL


---

12. Phase 3 — Authentication

Implement:

Register
Login
Logout
Get Current User

Register

POST /api/auth/register

Flow:

User enters details
        ↓
Validate with Zod
        ↓
Check email/phone
        ↓
Hash password
        ↓
Create user
        ↓
Create session
        ↓
Return user


---

13. Login

POST /api/auth/login

Flow:

Email + Password
       ↓
Find user
       ↓
Compare bcrypt hash
       ↓
Generate JWT/session
       ↓
HTTP-only cookie
       ↓
Login successful


---

14. Authentication Middleware

Protected API:

GET /api/orders

should work only when authenticated.

Flow:

Request
  ↓
Auth Middleware
  ↓
Valid session?
  ├── NO → 401
  │
  └── YES
       ↓
    Controller


---

15. Admin Authorization

Admin APIs require:

Authentication
      +
ADMIN role

Example:

PATCH /api/admin/orders/:id/status

Flow:

Request
 ↓
Auth Middleware
 ↓
Admin Middleware
 ↓
Controller

Customer should receive:

403 Forbidden

if they try to access admin APIs.


---

16. Phase 4 — Product Implementation

Customer API:

GET /api/products
GET /api/products/:id

Admin API:

POST /api/admin/products
PATCH /api/admin/products/:id
DELETE /api/admin/products/:id

Product creation:

Admin
 ↓
Product Form
 ↓
Zod Validation
 ↓
API
 ↓
Cloudinary Image Upload
 ↓
Product URL
 ↓
MySQL


---

17. Product Listing

Customer homepage:

GET /api/products

Backend returns:

{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Brown Eggs",
      "price": 115,
      "packSize": 12,
      "imageUrl": "..."
    }
  ]
}

Frontend displays:

┌─────────────────────┐
│      Egg Image      │
│                     │
│ Brown Eggs          │
│ 12 Eggs             │
│ ₹115                │
│                     │
│ [ Add to Cart ]     │
└─────────────────────┘


---

18. Phase 5 — Cart Implementation

Customer:

Add to Cart

Request:

POST /api/cart/items

Example:

{
  "productId": 1,
  "quantity": 2
}

Backend:

Authenticate user
       ↓
Find user's cart
       ↓
Check product
       ↓
Check inventory
       ↓
Add/update cart item


---

19. Cart Page

Frontend calls:

GET /api/cart

Display:

Brown Eggs
₹115 × 2

Country Eggs
₹145 × 1

----------------
Subtotal ₹375
Delivery ₹30
Total ₹405

[ Proceed to Checkout ]


---

20. Phase 6 — Checkout

Checkout steps:

Cart
 ↓
Address
 ↓
Payment Method
 ↓
Order Summary
 ↓
Place Order

Payment methods:

Online Payment
Cash on Delivery


---

21. Order Creation

Endpoint:

POST /api/orders

Backend must:

1. Authenticate user
2. Validate address
3. Get cart
4. Get products from database
5. Check inventory
6. Calculate subtotal
7. Calculate delivery
8. Calculate discount
9. Calculate final total
10. Create order
11. Create order items
12. Update inventory
13. Create payment record
14. Clear cart
15. Create notification


---

22. Important — Never Trust Frontend Price

Frontend may send:

{
  "total": 100
}

Do not directly use it.

Backend should retrieve current prices from MySQL:

Product
 ↓
Database Price
 ↓
Calculate Total
 ↓
Create Order

This prevents price manipulation.


---

23. Inventory Transaction

Order creation should use a database transaction.

Conceptually:

BEGIN TRANSACTION

Check stock

Create order

Create order items

Reduce stock

Create payment

Clear cart

COMMIT

If something fails:

ROLLBACK

This prevents situations such as:

Order created ✓
Stock update failed ✗
Payment record missing ✗


---

24. Phase 7 — Payment

For Razorpay:

Customer
   ↓
Checkout
   ↓
Backend
   ↓
Create Razorpay Order
   ↓
Frontend opens Razorpay
   ↓
Customer pays
   ↓
Payment response
   ↓
Backend verifies signature
   ↓
Payment SUCCESS
   ↓
Order confirmed

Never mark payment as successful merely because the frontend says it succeeded.


---

25. Cash on Delivery

COD is simpler:

Customer selects COD
       ↓
Create Order
       ↓
payment_status = COD
       ↓
order_status = PENDING
       ↓
Admin confirms


---

26. Phase 8 — Order Management

Customer:

GET /api/orders

Shows:

My Orders

ORD-0001
Brown Eggs × 2

₹230

Status:
Preparing

Order details:

GET /api/orders/:id


---

27. Admin Order Management

Admin dashboard:

GET /api/admin/orders

Admin sees:

Order ID
Customer
Items
Amount
Payment
Status
Date
Actions

Admin can update:

PENDING
 ↓
CONFIRMED
 ↓
PREPARING
 ↓
OUT_FOR_DELIVERY
 ↓
DELIVERED


---

28. Order Status Update

API:

PATCH /api/admin/orders/:id/status

Request:

{
  "status": "PREPARING",
  "note": "Order is being packed"
}

Backend performs:

Update orders
       ↓
Insert order_status_history
       ↓
Create notification


---

29. Customer Order Tracking

Customer sees:

Order Placed
     ✓
     │
Order Confirmed
     ✓
     │
Preparing
     ✓
     │
Out for Delivery
     ●
     │
Delivered
     ○

This can be implemented using the order_status_history table.


---

30. Phase 9 — Admin Dashboard

Dashboard API:

GET /api/admin/dashboard

Return:

Total Orders
Today's Orders
Total Revenue
Customers
Pending Orders
Low Stock Products

Frontend:

┌──────────────┐ ┌──────────────┐
│ Total Orders │ │   Revenue    │
│    1,250     │ │ ₹2,45,000    │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│  Customers   │ │ Pending      │
│     850      │ │     25       │
└──────────────┘ └──────────────┘


---

31. Admin Product Management

Admin can:

Add Product
Edit Product
Delete Product
Activate Product
Deactivate Product
Update Price
Update Pack Size

Example:

Products
────────────────────────────────
Brown Eggs      ₹115    Active
Country Eggs    ₹145    Active
White Eggs       ₹90    Active
Organic Eggs    ₹180    Inactive


---

32. Admin Inventory

Admin sees:

Product         Stock       Status
────────────────────────────────────
Brown Eggs       120        Healthy
Country Eggs      15        Low Stock
White Eggs         5        Critical

Use:

quantity <= low_stock_threshold

for low-stock detection.


---

33. Phase 10 — Frontend Implementation

Frontend structure:

frontend/
│
├── app/
│   ├── page.tsx
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── login/
│   ├── register/
│   │
│   └── admin/
│       ├── dashboard/
│       ├── products/
│       ├── orders/
│       ├── inventory/
│       ├── customers/
│       └── analytics/
│
├── components/
├── services/
├── hooks/
├── lib/
├── types/
└── styles/


---

34. Customer Pages

Build these first:

/
├── Home
│
├── /products
│
├── /products/[id]
│
├── /cart
│
├── /checkout
│
├── /orders
│
├── /orders/[id]
│
├── /login
│
├── /register
│
└── /profile


---

35. Admin Pages

/admin
    ↓
/admin/dashboard

/admin/products
/admin/products/new
/admin/products/[id]

/admin/orders
/admin/orders/[id]

/admin/inventory

/admin/customers

/admin/analytics


---

36. API Service Layer

Frontend should not scatter API calls everywhere.

Create:

services/
├── auth.service.ts
├── product.service.ts
├── cart.service.ts
├── order.service.ts
├── payment.service.ts
└── admin.service.ts

Example:

ProductPage
    ↓
product.service.ts
    ↓
GET /api/products/:id


---

37. Error Handling

Standard response:

{
  "success": false,
  "message": "Product is out of stock",
  "code": "OUT_OF_STOCK"
}

Frontend:

API Error
   ↓
Toast
   ↓
"Sorry, this product is currently out of stock."


---

38. Loading States

Every API-driven page should have:

Loading
Empty
Error
Success

Example:

Loading:
Product skeleton

Empty:
"No products available"

Error:
"Unable to load products"

Success:
Product grid


---

39. Security Implementation

Implement:

Authentication

HTTP-only cookies

Password

bcrypt

Authorization

CUSTOMER
ADMIN

Validation

Zod

Database

Use parameterized/ORM queries.

Payment

Verify Razorpay signature on backend.

Secrets

Keep all secrets in .env.


---

40. Testing Strategy

Backend API Testing

Use Postman.

Test:

Auth
Products
Cart
Orders
Payments
Admin

Example:

POST /api/auth/register
POST /api/auth/login

GET /api/products

POST /api/cart/items

POST /api/orders

GET /api/orders


---

41. Database Testing

In MySQL Workbench verify:

users
products
inventory
orders
order_items
payments

After placing an order:

orders             → new row
order_items        → new rows
inventory          → stock reduced
payments           → payment row
notifications      → notification row


---

42. Complete Implementation Sequence

Don't try to build everything at once.

Phase 1

MySQL
 ↓
Database
 ↓
Tables
 ↓
Prisma

Phase 2

Backend
 ↓
Express
 ↓
Auth
 ↓
Products

Phase 3

Cart
 ↓
Address
 ↓
Checkout

Phase 4

Orders
 ↓
Inventory
 ↓
Order Tracking

Phase 5

Razorpay
 ↓
Payment Verification

Phase 6

Admin Dashboard
 ↓
Products
 ↓
Orders
 ↓
Inventory
 ↓
Customers
 ↓
Analytics

Phase 7

Reviews
Notifications
Animations
Responsive UI


---

43. MVP Priority

If you want a working project quickly, prioritize:

🔥 MUST HAVE

1. Customer Registration/Login
2. Product Listing
3. Product Details
4. Cart
5. Address
6. Checkout
7. COD
8. Orders
9. Admin Login
10. Admin Orders
11. Order Status
12. Product Management
13. Inventory

Then:

⭐ PHASE 2

14. Razorpay
15. Reviews
16. Notifications
17. Analytics
18. Coupons
19. Delivery tracking


---

44. Final End-to-End Implementation

CUSTOMER
                            │
                            ▼
                     Next.js Website
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
           Products        Cart        Account
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                         Checkout
                            │
                     Address + Payment
                            │
                            ▼
                       Express API
                            │
                     Business Logic
                            │
                            ▼
                         Prisma
                            │
                            ▼
                          MySQL
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
         Orders          Inventory       Payments
            │
            ▼
      Order Status History
            │
            ▼
        Notification
            │
            ▼
          Customer


                         ADMIN
                           │
                           ▼
                    Admin Dashboard
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          Products       Orders       Inventory
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                       Express API
                           │
                           ▼
                         MySQL

🚀 Build Order

Start with this exact order:

MySQL Workbench → Database Schema → Prisma → Express Backend → Authentication → Products → Cart → Checkout → Orders → Inventory → Admin Dashboard → Razorpay → Testing → Deployment.

That sequence avoids building the frontend against an unstable backend and makes the whole project much easier to implement.