🥚 Egg Business — Product Requirements Document (PRD)
1. Product Overview

Product Name: EggCart / Egg Business Management System

Product Type: Full-Stack E-Commerce + Order Management Platform

Objective

Build a modern web application where customers can browse different types of eggs, select quantities, place orders, make payments, and track their orders.

The business admin will have a dedicated dashboard to manage products, inventory, customers, orders, payments, and delivery status.

2. Problem Statement

Traditional egg businesses often manage orders through phone calls, WhatsApp, notebooks, or spreadsheets.

This creates problems such as:

Orders getting missed
Difficulty tracking customer orders
Manual stock management
No centralized order history
Difficult revenue tracking
No proper customer management
Lack of real-time order status

The proposed system solves these problems through a centralized digital platform.

3. Target Users
👤 Customer

A person who wants to purchase eggs online and receive them at their address.

👨‍💼 Admin

The egg-business owner/staff who manages:

Products
Prices
Inventory
Orders
Customers
Payments
Delivery status
Business analytics
4. Core User Flow
Customer
   ↓
Visit Website
   ↓
Browse Eggs
   ↓
Select Product
   ↓
Select Quantity
   ↓
Add to Cart
   ↓
Checkout
   ↓
Enter Delivery Address
   ↓
Choose Payment Method
   ↓
Place Order
   ↓
Order Created
   ↓
Admin Receives Order
   ↓
Admin Processes Order
   ↓
Out for Delivery
   ↓
Delivered
5. Customer Features
5.1 Landing Page

The homepage should contain:

Business branding
Hero section
Egg products
Featured products
Benefits
How it works
Customer reviews
Contact information
CTA — Order Now

Example:

Fresh Eggs. Delivered to Your Door. 🥚

6. Authentication

Customers should be able to:

Register
Login
Logout
Forgot password
Reset password
Manage profile
Customer Profile

Store:

Name
Email
Phone
Addresses
Order history
7. Product Catalog

Customers can browse available egg products.

Each product should contain:

Product image
Product name
Description
Egg type
Pack size
Price
Available stock
Rating
Availability status
Example Products
Product	Pack	Price
White Eggs	6	₹45
White Eggs	12	₹90
White Eggs	30	₹210
Brown Eggs	6	₹60
Brown Eggs	12	₹115
Country Eggs	6	₹75
Country Eggs	12	₹145

Prices should be configurable by the admin.

8. Product Search & Filtering

Customers should be able to:

Search eggs
Filter by egg type
Filter by price
Sort by price
Sort by popularity
Sort by newest
View available/unavailable products
9. Product Details

When a customer opens a product:

Product Image


Brown Eggs


₹115
Pack of 12


Description


Fresh farm eggs...


★★★★★


Quantity
[-] 1 [+]


[ Add to Cart ]

Display:

Product image
Name
Description
Price
Pack size
Stock availability
Quantity selector
Add to cart
10. Shopping Cart

Customer can:

Add products
Remove products
Increase quantity
Decrease quantity
View subtotal
View delivery fee
View total

Example:

Cart


Brown Eggs × 2
₹230


Country Eggs × 1
₹145


----------------


Subtotal       ₹375
Delivery       ₹30


Total          ₹405


[ Proceed to Checkout ]
11. Checkout

Checkout should contain:

Customer Information
Full name
Phone number
Email
Delivery Address
House/Flat number
Street
Area
City
State
Pincode
Payment Method
Razorpay / Online Payment
Cash on Delivery
Order Summary

Display:

Products
Quantity
Subtotal
Delivery fee
Discount
Total

Button:

Place Order

12. Order Creation

After successful checkout:

Generate a unique order ID.

Example:

Order ID: ORD-20260814-00125

Customer sees:

🎉 Order placed successfully!

Display:

Order ID
Products
Total amount
Payment status
Delivery address
Estimated delivery
Current order status
13. Order Tracking

Order status workflow:

🟡 Pending
      ↓
🔵 Confirmed
      ↓
🟣 Preparing
      ↓
🚚 Out for Delivery
      ↓
🟢 Delivered

Customer should be able to view the current status.

14. Customer Order History

Customer dashboard should contain:

My Orders
ORD-00125
Brown Eggs × 2
₹230


Status: Out for Delivery


[View Order]

Customer can view:

Previous orders
Current orders
Order details
Payment status
Delivery status
15. Admin Dashboard

Admin login should open a separate dashboard.

Dashboard Overview

Display:

Total Orders       1,245


Pending Orders       24


Today's Orders       58


Total Customers     842


Total Revenue    ₹2,45,600


Low Stock Products     6
16. Admin Product Management

Admin can:

Add Product
Product name
Egg type
Description
Price
Pack size
Stock quantity
Product image
Availability
Edit Product

Admin can modify:

Price
Description
Stock
Image
Availability
Delete Product

Admin can remove products.

Product Status
Available
Out of Stock
Inactive
17. Inventory Management

Admin should be able to track egg stock.

Example:

Brown Eggs
Stock: 120 packs


White Eggs
Stock: 250 packs


Country Eggs
Stock: 45 packs

When a customer places an order:

Stock automatically decreases

Example:

Before:
Brown Eggs = 120


Customer orders:
5


After:
Brown Eggs = 115
Low Stock Alert

If stock falls below configured threshold:

⚠️ Brown Eggs stock is low — 8 packs remaining.

18. Admin Order Management

Admin can view all orders.

Table:

Order ID	Customer	Amount	Payment	Status
ORD001	Ravi	₹450	Paid	Preparing
ORD002	Suresh	₹230	COD	Pending
ORD003	Kumar	₹680	Paid	Delivered

Admin can open an order and see:

Customer details
Phone
Address
Products
Quantity
Total amount
Payment status
Order status
19. Order Status Management

Admin can change:

Pending
↓
Confirmed
↓
Preparing
↓
Out for Delivery
↓
Delivered

Admin can also:

Cancel order
Reject order
Update delivery status

Every status change should be recorded.

20. Customer Management

Admin can view:

Customer name
Email
Phone
Registration date
Total orders
Total spending
Account status

Admin can view individual customer order history.

21. Payment Management

Integrate Razorpay for online payments.

Payment flow:

Customer
   ↓
Checkout
   ↓
Razorpay
   ↓
Payment
   ↓
Payment Verification
   ↓
Order Confirmation

Payment statuses:

Pending
Paid
Failed
Refunded
COD

Important: Payment should be verified on the backend before marking an order as paid.

22. Notifications

Customer should receive notifications for important events.

Order Placed

Your order ORD001 has been placed successfully.

Order Confirmed

Your order has been confirmed.

Out for Delivery

Your order is out for delivery 🚚

Delivered

Your order has been delivered successfully.

Notifications can later be implemented through:

Email
WhatsApp
SMS
Push notifications
23. Admin Analytics

Admin dashboard should provide business insights.

Metrics
Total revenue
Daily revenue
Weekly revenue
Monthly revenue
Total orders
Completed orders
Cancelled orders
Average order value
Most-selling products
Low-stock products
Charts

Use charts for:

Revenue
Orders
Products
Customers
24. Database Design

Recommended database:

PostgreSQL + Prisma ORM

Main Tables
User
Product
Category
Cart
CartItem
Order
OrderItem
Address
Payment
Inventory
Review
Notification
25. User Model
User
 ├── id
 ├── name
 ├── email
 ├── phone
 ├── password
 ├── role
 ├── createdAt
 └── updatedAt

Roles:

CUSTOMER
ADMIN
26. Product Model
Product
 ├── id
 ├── name
 ├── description
 ├── type
 ├── packSize
 ├── price
 ├── stock
 ├── image
 ├── isActive
 ├── createdAt
 └── updatedAt
27. Order Model
Order
 ├── id
 ├── orderNumber
 ├── userId
 ├── addressId
 ├── subtotal
 ├── deliveryFee
 ├── discount
 ├── total
 ├── paymentStatus
 ├── orderStatus
 ├── createdAt
 └── updatedAt
28. Order Item
OrderItem
 ├── id
 ├── orderId
 ├── productId
 ├── quantity
 ├── price
 └── total

Important: price should be stored in OrderItem so that old orders don't change if the admin later changes the product price.

29. Recommended Tech Stack
Frontend
Next.js
TypeScript
React
CSS / CSS Modules
Framer Motion
Backend

Since you're using Next.js, you can initially use:

Next.js Route Handlers / API
TypeScript

For a larger version:

Node.js
Express
Database
PostgreSQL
Neon
Prisma ORM
Authentication
Auth.js / NextAuth
Payment
Razorpay
Images
Cloudinary
Deployment

Frontend/backend:

Vercel

Database:

Neon PostgreSQL
30. Main Pages
Customer
/
├── Home
├── Products
├── Products/[id]
├── Cart
├── Checkout
├── Order Success
├── Orders
├── Orders/[id]
├── Profile
├── Login
└── Register
Admin
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
31. Security Requirements

The application must implement:

Secure authentication
Password hashing
Role-based authorization
Admin route protection
Input validation
API validation
Rate limiting
Secure payment verification
Environment variables for secrets
Protection against unauthorized order modification

A customer must never be able to access admin APIs simply by changing the URL.

32. Responsive Design

The application must work properly on:

📱 Mobile
📱 Tablet
💻 Laptop
🖥️ Desktop

Especially the customer ordering flow should be optimized for mobile.

Admin dashboard should also be responsive.

33. UI/UX Direction

Design should feel like a modern premium grocery/food-commerce platform, not a basic college project.

Suggested style:

Clean white background
Fresh green/natural accent
High-quality egg/product photography
Rounded cards
Smooth animations
Clear CTA buttons
Minimal checkout process
Mobile-first layout

Avoid making the UI unnecessarily complicated.

34. MVP Scope

For the first version, focus on:

Customer

✅ Register/Login
✅ Browse products
✅ Product details
✅ Cart
✅ Checkout
✅ Address
✅ COD
✅ Online payment
✅ Place order
✅ Order history
✅ Order tracking

Admin

✅ Dashboard
✅ Product CRUD
✅ Inventory
✅ Order management
✅ Customer management
✅ Payment status
✅ Order status

35. Future Features

After the MVP works, you can add:

🥚 Subscription

Example:

12 eggs every Monday and Thursday

🎁 Offers
Buy 2 get discount
First-order discount
Festival offers
📍 Delivery Tracking

Real-time delivery tracking.

🤖 AI

This is where your project can become more advanced:

AI product recommendations
Demand prediction
Stock prediction
Customer purchase prediction
AI chatbot
Voice-based ordering
Personalized offers
📊 Business Intelligence

AI can predict:

"Based on the previous 30 days, approximately 180 packs of brown eggs may be required next week."

36. Final Architecture
                   CUSTOMER
                       │
                       ▼
                Next.js Website
                       │
          ┌────────────┴────────────┐
          │                         │
      Products                   Checkout
          │                         │
          ▼                         ▼
        Cart                    Razorpay
          │                         │
          └────────────┬────────────┘
                       │
                       ▼
                Backend / API
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       Prisma       Auth        Payments
          │
          ▼
    PostgreSQL / Neon
          │
          ▼
    ADMIN DASHBOARD
          │
    ┌─────┼──────┬─────────┐
    ▼     ▼      ▼         ▼
 Products Orders Inventory Customers
🎯 Project Goal

The final system should allow the business owner to run the complete egg-ordering business digitally:

Customer orders → Database → Admin receives → Admin processes → Inventory updates → Delivery → Customer gets order status.

And importantly, this PRD gives you a solid foundation to build it as a real-world production-style full-stack project, not just a CRUD college project.