# 🥚 Egg Business — Frontend Documentation

## 1. Frontend Overview

The frontend is a **responsive e-commerce web application** for an egg-selling business.

It has two separate experiences:

```text
                    EGG BUSINESS FRONTEND
                            │
              ┌─────────────┴─────────────┐
              │                           │
       CUSTOMER WEBSITE              ADMIN PANEL
              │                           │
       Browse & Purchase              Manage Business
              │                           │
       Products / Cart               Orders / Products
       Checkout / Orders             Inventory / Users
       Profile / Tracking            Payments / Analytics
```

---

# 2. Recommended Frontend Stack

| Technology               | Purpose                     |
| ------------------------ | --------------------------- |
| Next.js                  | Frontend framework          |
| TypeScript               | Type safety                 |
| React                    | UI components               |
| CSS Modules / Global CSS | Styling                     |
| Framer Motion            | Animations                  |
| React Hook Form          | Forms                       |
| Zod                      | Validation                  |
| TanStack Query           | API/server-state management |
| Lucide React             | Icons                       |
| Recharts                 | Admin analytics             |
| Next Image               | Image optimization          |

**Important:** Keep the frontend clean and component-based. Avoid putting business logic directly inside page components.

---

# 3. Frontend Architecture

```text
Browser
   │
   ▼
Next.js Application
   │
   ├── Public Pages
   │
   ├── Customer Pages
   │
   └── Admin Pages
          │
          ▼
      API Services
          │
          ▼
       Backend API
          │
          ▼
       Database
```

---

# 4. Application Sections

The frontend should contain three major sections.

### Public

Accessible without authentication.

```text
/
├── Home
├── Products
├── Product Details
├── About
├── Contact
├── Login
└── Register
```

### Customer

Requires customer authentication.

```text
/account
├── Dashboard
├── Orders
├── Orders/[id]
├── Profile
├── Addresses
└── Settings
```

### Admin

Requires admin authentication.

```text
/admin
├── Dashboard
├── Orders
├── Orders/[id]
├── Products
├── Products/new
├── Products/[id]/edit
├── Inventory
├── Customers
├── Payments
├── Analytics
└── Settings
```

---

# 5. Recommended Folder Structure

```text
egg-business/
│
├── app/
│   │
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── cart/
│   │   └── page.tsx
│   │
│   ├── checkout/
│   │   └── page.tsx
│   │
│   ├── order-success/
│   │   └── page.tsx
│   │
│   ├── account/
│   │   ├── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── addresses/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── orders/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── customers/
│   │   ├── payments/
│   │   ├── analytics/
│   │   └── settings/
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── home/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── account/
│   └── admin/
│
├── services/
│   ├── auth.service.ts
│   ├── product.service.ts
│   ├── cart.service.ts
│   ├── order.service.ts
│   ├── payment.service.ts
│   └── admin.service.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useProducts.ts
│   └── useOrders.ts
│
├── types/
│   ├── user.ts
│   ├── product.ts
│   ├── cart.ts
│   ├── order.ts
│   └── payment.ts
│
├── lib/
│   ├── api.ts
│   ├── utils.ts
│   └── validations.ts
│
└── public/
    ├── images/
    └── icons/
```

---

# 6. Design System

The UI should communicate:

**Fresh + Trustworthy + Premium + Simple**

### Visual Direction

Use:

* Clean layouts
* Large product images
* Rounded cards
* Subtle shadows
* Clear typography
* Smooth hover states
* Minimal animations
* Strong CTA buttons

Avoid:

* Overloaded screens
* Too many colors
* Excessive animations
* Complicated checkout
* Tiny text
* Unnecessary popups

---

# 7. Color System

Suggested design tokens:

```text
Primary:
Fresh Green

Secondary:
Warm Yellow

Background:
Off White

Surface:
White

Text:
Dark Charcoal

Muted:
Gray

Success:
Green

Warning:
Orange

Error:
Red
```

Keep the colors consistent across the entire application.

---

# 8. Typography

Use a modern sans-serif font.

Hierarchy:

```text
H1 → Page hero
H2 → Section heading
H3 → Card heading
Body → Normal content
Small → Metadata
```

Example:

```text
Fresh Eggs,
Delivered to Your Door.

Premium quality eggs delivered
fresh to your doorstep.

[ Shop Now ]
```

---

# 9. Global Components

Create reusable components instead of repeating UI.

### UI Components

```text
Button
Input
Select
Modal
Dialog
Badge
Card
Dropdown
Tabs
Toast
Skeleton
Spinner
Pagination
```

### Business Components

```text
ProductCard
ProductGrid
QuantitySelector
PriceDisplay
CartItem
OrderCard
OrderStatus
OrderTimeline
AddressCard
PaymentMethod
```

---

# 10. Customer Navbar

Desktop:

```text
┌────────────────────────────────────────────────────┐
│ 🥚 Egg Business    Home  Shop  About  Contact      │
│                              Orders  🛒  Account     │
└────────────────────────────────────────────────────┘
```

Mobile:

```text
┌────────────────────────────┐
│ 🥚 Logo        🛒  ☰       │
└────────────────────────────┘
```

Navbar should remain simple.

---

# 11. Homepage

## Section Flow

```text
Navbar
   ↓
Hero
   ↓
Featured Products
   ↓
Why Choose Us
   ↓
How It Works
   ↓
Popular Products
   ↓
Customer Reviews
   ↓
CTA
   ↓
Footer
```

### Hero

```text
Fresh Eggs.
Delivered to Your Door.

Farm-fresh quality eggs,
delivered conveniently to your home.

[ Shop Eggs ]

              🥚
       Product / Egg Image
```

---

# 12. Product Listing Page

Route:

```text
/products
```

Layout:

```text
Products
Fresh eggs for your everyday needs.

┌─────────────┐
│ Search      │
└─────────────┘

Filters

┌────────┐ ┌────────┐ ┌────────┐
│ Product│ │ Product│ │ Product│
│ ₹90    │ │ ₹115   │ │ ₹145   │
│ [Cart] │ │ [Cart] │ │ [Cart] │
└────────┘ └────────┘ └────────┘
```

Features:

* Search
* Filter
* Sort
* Product grid
* Pagination/load more

---

# 13. Product Card

Every product card should display:

```text
┌────────────────────────┐
│                        │
│      PRODUCT IMAGE     │
│                        │
├────────────────────────┤
│ Brown Eggs             │
│ Pack of 12             │
│                        │
│ ₹115                   │
│                        │
│ ● In Stock             │
│                        │
│ [ Add to Cart ]        │
└────────────────────────┘
```

---

# 14. Product Details Page

Route:

```text
/products/[id]
```

Layout:

```text
┌──────────────────┬─────────────────────────┐
│                  │ Brown Eggs              │
│                  │                         │
│   Product Image  │ ₹115                    │
│                  │ Pack of 12              │
│                  │                         │
│                  │ Description             │
│                  │                         │
│                  │ Quantity [-] 1 [+]      │
│                  │                         │
│                  │ [ Add to Cart ]         │
└──────────────────┴─────────────────────────┘
```

---

# 15. Cart Page

Route:

```text
/cart
```

### Desktop

```text
Cart Items                     Summary

Brown Eggs × 2                 Subtotal ₹230
₹115                           Delivery ₹30

Country Eggs × 1               Total ₹375
₹145

[ Continue Shopping ]          [ Checkout ]
```

### Mobile

Cart should become a single-column layout.

---

# 16. Checkout Page

Checkout should be extremely simple.

```text
Checkout
   │
   ├── Delivery Address
   │
   ├── Order Items
   │
   ├── Delivery Fee
   │
   ├── Payment Method
   │
   └── Final Total
```

CTA:

**Place Order**

The CTA should remain clearly visible on mobile.

---

# 17. Payment UI

Payment options:

```text
○ Cash on Delivery

○ Online Payment
   Razorpay
```

When online payment is selected:

```text
[ Pay ₹405 ]
```

After payment:

```text
✓ Payment Successful

Order Confirmed
```

---

# 18. Order Success Page

Route:

```text
/order-success
```

Design:

```text
              ✓

       Order Confirmed!

       ORD-20260814-00125

       ₹405

       Your order has been
       successfully placed.

       [ Track Order ]

       [ Continue Shopping ]
```

---

# 19. Customer Account

Route:

```text
/account
```

Dashboard:

```text
Welcome, Customer 👋

┌────────────┐ ┌────────────┐
│ Orders     │ │ Delivered  │
│ 12         │ │ 10         │
└────────────┘ └────────────┘

Recent Orders
```

---

# 20. Orders Page

```text
My Orders

┌──────────────────────────────────┐
│ ORD00125                         │
│ Brown Eggs × 2                   │
│ ₹230                             │
│                                  │
│ 🟣 Preparing                     │
│                                  │
│ [ View Order ]                   │
└──────────────────────────────────┘
```

---

# 21. Order Details

```text
Order #ORD00125

Order Status

✓ Order Placed
│
✓ Confirmed
│
● Preparing
│
○ Out for Delivery
│
○ Delivered

--------------------------------

Items

Brown Eggs × 2       ₹230

--------------------------------

Delivery Address

Customer Address

--------------------------------

Total                 ₹260
```

---

# 22. Admin Frontend

Admin should have a different visual system from the customer website.

```text
┌──────────────┬──────────────────────────────────┐
│              │                                  │
│ Dashboard    │                                  │
│ Orders       │          MAIN CONTENT            │
│ Products     │                                  │
│ Inventory    │                                  │
│ Customers    │                                  │
│ Payments     │                                  │
│ Analytics    │                                  │
│ Settings     │                                  │
│              │                                  │
└──────────────┴──────────────────────────────────┘
```

---

# 23. Admin Dashboard

Route:

```text
/admin
```

### Statistics

```text
┌──────────────┐ ┌──────────────┐
│ Total Orders │ │ Revenue      │
│ 1,245        │ │ ₹2,45,600    │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│ Customers    │ │ Low Stock    │
│ 842          │ │ 6            │
└──────────────┘ └──────────────┘
```

Below:

```text
Revenue Chart

Recent Orders

Low Stock Products
```

---

# 24. Admin Orders Page

```text
Orders

Search Order
Filter Status
Filter Date

┌────────┬──────────┬────────┬──────────┬──────────┐
│ ID     │ Customer │ Amount │ Payment  │ Status   │
├────────┼──────────┼────────┼──────────┼──────────┤
│ ORD001 │ Ravi     │ ₹450   │ Paid     │ Preparing│
│ ORD002 │ Kumar    │ ₹230   │ COD      │ Pending  │
└────────┴──────────┴────────┴──────────┴──────────┘
```

---

# 25. Admin Order Details

Admin can see:

```text
Order #ORD00125

Customer
Name
Phone
Email

Delivery Address
Address

Products
Product
Quantity
Price

Payment
Payment Status

Order Status

[ Confirm ]
[ Preparing ]
[ Out for Delivery ]
[ Delivered ]
[ Cancel Order ]
```

---

# 26. Admin Product Management

```text
Products

[ + Add Product ]

Search Products

┌─────────┬──────────┬───────┬───────┬─────────┐
│ Product │ Type     │ Price │ Stock │ Actions │
├─────────┼──────────┼───────┼───────┼─────────┤
│ Brown   │ Brown    │ ₹115  │ 120   │ Edit    │
│ White   │ White    │ ₹90   │ 250   │ Edit    │
└─────────┴──────────┴───────┴───────┴─────────┘
```

---

# 27. Add Product UI

```text
Add New Product

Product Name
[________________]

Egg Type
[ Select ]

Pack Size
[________________]

Price
[________________]

Stock
[________________]

Description
[________________________]

Product Image
[ Upload ]

Availability
[ Active ]

[ Cancel ] [ Save Product ]
```

Use form validation before submission.

---

# 28. Inventory UI

```text
Inventory

┌──────────────┬─────────┬──────────────┐
│ Product      │ Stock   │ Status       │
├──────────────┼─────────┼──────────────┤
│ White Eggs   │ 250     │ 🟢 Healthy   │
│ Brown Eggs   │ 120     │ 🟢 Healthy   │
│ Country Eggs │ 8       │ 🔴 Low Stock │
└──────────────┴─────────┴──────────────┘
```

---

# 29. Admin Customers

```text
Customers

Search Customer

┌─────────┬────────────────┬────────┬──────────┐
│ Name    │ Email          │ Orders │ Spending │
├─────────┼────────────────┼────────┼──────────┤
│ Ravi    │ ravi@email.com │ 12     │ ₹4,500   │
└─────────┴────────────────┴────────┴──────────┘
```

---

# 30. Admin Analytics

Charts:

```text
Revenue
   │
   │       ╭──╮
   │   ╭───╯  ╰──╮
   │───╯         ╰──
   └──────────────────
       Days
```

Display:

* Daily revenue
* Weekly revenue
* Monthly revenue
* Orders
* Average order value
* Best-selling products

---

# 31. Loading States

Never show a blank screen while data is loading.

Use skeletons:

```text
┌────────────────────┐
│ ████████████████   │
│ ████████           │
│ █████████████      │
└────────────────────┘
```

Examples:

* Product skeleton
* Order skeleton
* Dashboard skeleton
* Table skeleton

---

# 32. Empty States

Example cart:

```text
           🛒

       Your cart is empty

   Add some fresh eggs to
        get started.

      [ Shop Eggs ]
```

Orders:

```text
          📦

      No orders yet.

    [ Start Shopping ]
```

---

# 33. Error States

Example:

```text
Something went wrong.

We couldn't load the products.

[ Try Again ]
```

Never expose raw backend errors to customers.

---

# 34. Toast Notifications

Use toast messages for quick actions.

Examples:

```text
✓ Added to cart

✓ Product updated

✓ Order status updated

✓ Address saved

✕ Payment failed
```

---

# 35. Responsive Requirements

### Mobile

```text
320px+
```

### Tablet

```text
768px+
```

### Desktop

```text
1024px+
```

### Large Desktop

```text
1440px+
```

The website must not require horizontal scrolling.

---

# 36. Mobile Customer Flow

The most important mobile flow:

```text
Home
 ↓
Shop
 ↓
Product
 ↓
Add to Cart
 ↓
Cart
 ↓
Checkout
 ↓
Address
 ↓
Payment
 ↓
Order Success
 ↓
Track Order
```

This flow should be optimized heavily because customers may primarily use phones.

---

# 37. Frontend State Management

Separate state into:

### Server State

Use TanStack Query for:

```text
Products
Orders
Customer
Inventory
Admin data
```

### Client State

Use React state/context or a lightweight store for:

```text
Cart
UI state
Modal state
Filters
Checkout selections
```

Avoid storing sensitive information unnecessarily in browser storage.

---

# 38. API Service Layer

Frontend should not directly scatter `fetch()` calls throughout components.

Use:

```text
services/
   product.service.ts
   order.service.ts
   auth.service.ts
   payment.service.ts
   admin.service.ts
```

Example architecture:

```text
ProductPage
    ↓
useProducts()
    ↓
product.service.ts
    ↓
API
    ↓
Backend
```

---

# 39. Authentication & Route Protection

Frontend should protect:

```text
/account/*
/checkout
/admin/*
```

Role-based behavior:

```text
CUSTOMER
   ↓
/account

ADMIN
   ↓
/admin
```

Unauthorized user:

```text
Protected Page
      ↓
Not authenticated?
      ↓
Redirect → /login
```

Customer attempting admin:

```text
/admin
   ↓
Role ≠ ADMIN
   ↓
Access Denied / Redirect
```

---

# 40. Frontend API Requirements

Main APIs the frontend will consume:

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/products
GET    /api/products/:id

GET    /api/cart
POST   /api/cart
PATCH  /api/cart/:id
DELETE /api/cart/:id

POST   /api/orders
GET    /api/orders
GET    /api/orders/:id

POST   /api/payments/create
POST   /api/payments/verify

GET    /api/admin/dashboard
GET    /api/admin/orders
PATCH  /api/admin/orders/:id
GET    /api/admin/products
POST   /api/admin/products
PATCH  /api/admin/products/:id
DELETE /api/admin/products/:id
GET    /api/admin/inventory
GET    /api/admin/customers
GET    /api/admin/analytics
```

---

# 41. Frontend Security

Frontend must never contain:

```text
DATABASE_URL
RAZORPAY_SECRET
JWT_SECRET
CLOUDINARY_SECRET
Other private API keys
```

Only public environment variables should be exposed to the browser.

Example:

```text
NEXT_PUBLIC_API_URL
```

Secrets remain on the backend.

---

# 42. Accessibility

The application should support:

* Keyboard navigation
* Proper labels
* Alt text for images
* Accessible buttons
* Visible focus states
* Sufficient text contrast
* Semantic HTML

---

# 43. Performance

Optimize:

* Images
* Fonts
* JavaScript bundles
* API requests
* Product lists
* Admin tables

Use:

* Next.js Image
* Lazy loading
* Server components where appropriate
* Pagination
* Caching
* Skeleton loading

---

# 44. Frontend Development Priority

Build in this order:

```text
PHASE 1
↓
Design System
↓
Navbar + Footer
↓
Homepage

PHASE 2
↓
Product Listing
↓
Product Details
↓
Cart

PHASE 3
↓
Authentication
↓
Checkout
↓
Address

PHASE 4
↓
Payment
↓
Order Creation
↓
Order Success

PHASE 5
↓
Customer Dashboard
↓
Order History
↓
Order Tracking

PHASE 6
↓
Admin Layout
↓
Admin Dashboard
↓
Order Management

PHASE 7
↓
Product Management
↓
Inventory
↓
Customers
↓
Analytics

PHASE 8
↓
Responsive Testing
↓
Error Handling
↓
Performance
↓
Production Deployment
```

---

# 45. Final Frontend Architecture

```text
                         NEXT.JS
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
       PUBLIC            CUSTOMER           ADMIN
          │                 │                 │
      Homepage           Account          Dashboard
      Products           Orders           Orders
      About              Cart             Products
      Contact            Checkout         Inventory
                         Profile          Customers
                         Tracking         Payments
                                          Analytics
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                     SERVICE LAYER
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
           Products       Orders        Payments
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                        BACKEND API
                            │
                            ▼
                       PostgreSQL
```

### 🎯 Frontend's main principle

**Customer frontend = Simple & fast shopping experience.**

**Admin frontend = Powerful & data-driven management experience.**

And the most important UX path to perfect first is:

**Home → Products → Product Details → Cart → Checkout → Payment → Order Success → Track Order.**
