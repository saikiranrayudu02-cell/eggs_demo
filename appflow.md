 
# 🥚 Egg Business — App Flow Documentation

## 1. Overall Application Flow

```text
                    EGG BUSINESS PLATFORM
                            │
              ┌─────────────┴─────────────┐
              │                           │
         CUSTOMER APP                ADMIN PANEL
              │                           │
              ▼                           ▼
        Authentication              Admin Login
              │                           │
              ▼                           ▼
        Product Catalog             Dashboard
              │                    ┌──────┼──────┐
              ▼                    ▼      ▼      ▼
        Product Details         Orders Products Customers
              │                    │      │      │
              ▼                    ▼      ▼      ▼
             Cart                Inventory Analytics
              │
              ▼
           Checkout
              │
       ┌──────┴──────┐
       ▼             ▼
   COD Payment    Online Payment
       │             │
       └──────┬──────┘
              ▼
         Order Created
              │
              ▼
        Admin Receives
              │
              ▼
       Order Processing
              │
              ▼
       Out for Delivery
              │
              ▼
          Delivered
```

---

# 2. Customer App Flow

## 2.1 First Visit

Customer opens the website.

```text
Open Website
     ↓
Landing Page
     ↓
Browse Products
```

Customer does **not necessarily need to login just to browse products**.

They can view:

* Egg products
* Prices
* Pack sizes
* Availability
* Product details

Login can be required when proceeding to checkout.

---

# 3. Landing Page Flow

```text
Landing Page
     │
     ├── View Products
     │
     ├── Order Now
     │
     ├── Login
     │
     ├── Register
     │
     ├── About
     │
     └── Contact
```

### Main sections

```text
Navbar
   ↓
Hero Section
   ↓
Featured Eggs
   ↓
Why Choose Us?
   ↓
How It Works
   ↓
Customer Reviews
   ↓
CTA
   ↓
Footer
```

---

# 4. Registration Flow

```text
Register
   ↓
Enter Name
   ↓
Enter Email
   ↓
Enter Phone
   ↓
Create Password
   ↓
Confirm Password
   ↓
Validate
   ↓
Create Account
   ↓
Login
   ↓
Customer Dashboard
```

### Validation

System should check:

* Valid email
* Valid phone number
* Password requirements
* Existing email
* Password confirmation

---

# 5. Login Flow

```text
Login
  ↓
Email / Phone
  ↓
Password
  ↓
Authentication
  ↓
Check Role
  │
  ├── CUSTOMER → Customer Home
  │
  └── ADMIN → Admin Dashboard
```

---

# 6. Product Browsing Flow

```text
Products
   ↓
Search / Filter
   ↓
Product List
   ↓
Select Product
   ↓
Product Details
```

Product card:

```text
┌─────────────────────┐
│      Egg Image      │
│                     │
│ Brown Eggs          │
│ Pack of 12          │
│ ₹115                │
│                     │
│ [ Add to Cart ]     │
└─────────────────────┘
```

---

# 7. Product Details Flow

```text
Product Details
      │
      ├── Product Image
      ├── Product Name
      ├── Description
      ├── Pack Size
      ├── Price
      ├── Stock
      └── Quantity
             │
             ▼
       Add to Cart
```

If stock is unavailable:

```text
Out of Stock
     ↓
Disable Add to Cart
```

---

# 8. Cart Flow

```text
Add Product
     ↓
Cart
     │
     ├── Product
     ├── Quantity
     ├── Price
     └── Total
     │
     ▼
Update Quantity
     │
     ├── Increase
     └── Decrease
     │
     ▼
Cart Total
     ↓
Proceed to Checkout
```

### Cart calculation

```text
Subtotal
   +
Delivery Fee
   -
Discount
   =
Final Total
```

---

# 9. Authentication Check Before Checkout

```text
Proceed to Checkout
          ↓
     Is User Logged In?
          │
      ┌───┴───┐
      │       │
     YES      NO
      │       │
      │       ▼
      │    Login/Register
      │       │
      │       ▼
      └──→ Checkout
```

---

# 10. Checkout Flow

Checkout should be divided into clear sections.

```text
Checkout
   ↓
Customer Information
   ↓
Delivery Address
   ↓
Order Summary
   ↓
Delivery Fee
   ↓
Payment Method
   ↓
Place Order
```

---

# 11. Address Flow

Customer can:

```text
Select Existing Address
          OR
      Add New Address
```

New address:

```text
Full Name
Phone
House / Flat
Street
Area
City
State
Pincode
```

Then:

```text
Save Address
     ↓
Select Address
     ↓
Continue
```

---

# 12. Payment Flow

There are two payment options.

## Option A — Cash on Delivery

```text
Checkout
   ↓
Select COD
   ↓
Place Order
   ↓
Create Order
   ↓
Payment Status = COD
   ↓
Order Status = PENDING
   ↓
Order Confirmation
```

---

## Option B — Online Payment

```text
Checkout
   ↓
Select Online Payment
   ↓
Create Pending Order
   ↓
Open Razorpay
   ↓
Customer Pays
   ↓
Payment Verification
   │
   ├── SUCCESS
   │      ↓
   │   Payment = PAID
   │      ↓
   │   Order = CONFIRMED
   │
   └── FAILED
          ↓
       Payment = FAILED
          ↓
       Retry Payment
```

---

# 13. Order Creation Flow

Once the payment/COD process succeeds:

```text
Validate Cart
      ↓
Check Product Stock
      ↓
Calculate Final Price
      ↓
Create Order
      ↓
Create Order Items
      ↓
Update Inventory
      ↓
Create Payment Record
      ↓
Clear Cart
      ↓
Send Notification
      ↓
Order Success Page
```

---

# 14. Order Success Flow

Customer sees:

```text
       🎉
Order Placed Successfully!

Order ID:
ORD-20260814-00125

Total:
₹405

Payment:
Paid

Delivery:
Expected Today / Tomorrow

[ Track Order ]
[ Continue Shopping ]
```

---

# 15. Customer Order Tracking

Order tracking:

```text
Order Placed
     ↓
Confirmed
     ↓
Preparing
     ↓
Out for Delivery
     ↓
Delivered
```

UI example:

```text
✓ Order Placed
      │
      ↓
✓ Confirmed
      │
      ↓
● Preparing
      │
      ↓
○ Out for Delivery
      │
      ↓
○ Delivered
```

---

# 16. Customer Order History

```text
My Orders
    │
    ├── Current Orders
    │
    └── Previous Orders
```

Each order:

```text
Order ID
Products
Date
Amount
Payment Status
Order Status

[ View Details ]
```

---

# 17. Customer Profile Flow

```text
Profile
  │
  ├── Personal Information
  │
  ├── Addresses
  │
  ├── Orders
  │
  ├── Password
  │
  └── Logout
```

---

# 18. Admin Flow

Admin has a completely separate application area.

```text
Admin Login
     ↓
Authentication
     ↓
Role Verification
     ↓
Admin Dashboard
```

If normal customer tries:

```text
/customer → /admin
```

System should reject access.

---

# 19. Admin Dashboard Flow

Dashboard displays:

```text
                 ADMIN DASHBOARD
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
   Orders          Revenue         Customers
       │               │               │
       └───────────────┼───────────────┘
                       ▼
                    Inventory
```

### Dashboard cards

```text
Total Orders
Today's Orders
Pending Orders
Revenue
Customers
Low Stock
```

---

# 20. Admin Product Management Flow

```text
Products
   │
   ├── View Products
   │
   ├── Add Product
   │
   ├── Edit Product
   │
   ├── Delete Product
   │
   └── Change Availability
```

### Add Product

```text
Add Product
     ↓
Product Name
     ↓
Egg Type
     ↓
Pack Size
     ↓
Price
     ↓
Stock
     ↓
Description
     ↓
Upload Image
     ↓
Save Product
```

---

# 21. Admin Inventory Flow

```text
Inventory
    ↓
View Stock
    ↓
Select Product
    ↓
Update Stock
    ↓
Save
```

Automatic stock reduction:

```text
Customer Order
      ↓
Order Confirmed
      ↓
Inventory Update
      ↓
Stock - Ordered Quantity
```

---

# 22. Admin Order Flow

```text
Admin Dashboard
      ↓
Orders
      ↓
Order List
      ↓
Select Order
      ↓
Order Details
```

Admin can see:

```text
Order ID
Customer
Phone
Address
Products
Quantity
Amount
Payment
Status
```

---

# 23. Admin Order Status Flow

```text
PENDING
   ↓
CONFIRMED
   ↓
PREPARING
   ↓
OUT_FOR_DELIVERY
   ↓
DELIVERED
```

Possible cancellation:

```text
PENDING
   ↓
CANCELLED
```

---

# 24. Customer + Admin Order Synchronization

This is one of the **most important flows**.

Example:

```text
CUSTOMER

Places Order
     │
     ▼
Order Status: PENDING
     │
     ▼
ADMIN DASHBOARD
     │
     ▼
Admin sees New Order
     │
     ▼
Admin clicks "Confirm"
     │
     ▼
DATABASE UPDATED
     │
     ▼
CUSTOMER

Order Status:
CONFIRMED
```

Then:

```text
Admin → Preparing
          ↓
Customer → Preparing

Admin → Out for Delivery
          ↓
Customer → Out for Delivery

Admin → Delivered
          ↓
Customer → Delivered
```

---

# 25. Customer Notification Flow

```text
Order Created
     ↓
Notification
     ↓
"Your order has been placed"
```

Then:

```text
Admin Confirms
     ↓
"Your order has been confirmed"
```

Then:

```text
Out for Delivery
     ↓
"Your order is out for delivery"
```

Finally:

```text
Delivered
     ↓
"Your order has been delivered"
```

---

# 26. Database Flow

The main relationship:

```text
USER
 │
 ├──────────────┐
 │              │
 ▼              ▼
ADDRESS       ORDER
                │
                ▼
           ORDER_ITEM
                │
                ▼
             PRODUCT
                │
                ▼
            INVENTORY
```

Payment:

```text
ORDER
  │
  ▼
PAYMENT
```

---

# 27. Complete End-to-End Flow

```text
                     CUSTOMER
                         │
                         ▼
                   Open Website
                         │
                         ▼
                  Browse Products
                         │
                         ▼
                  Select Product
                         │
                         ▼
                    Add to Cart
                         │
                         ▼
                     Checkout
                         │
                         ▼
                    Login/Register
                         │
                         ▼
                  Delivery Address
                         │
                         ▼
                   Order Summary
                         │
                         ▼
                   Payment Method
                    /          \
                   /            \
                 COD           Online
                  │              │
                  │           Razorpay
                  │              │
                  │         Verify Payment
                  │              │
                  └──────┬───────┘
                         ▼
                    Create Order
                         │
                         ▼
                  Update Inventory
                         │
                         ▼
                  Notify Customer
                         │
                         ▼
                   ADMIN DASHBOARD
                         │
                         ▼
                    New Order
                         │
                         ▼
                     Confirm
                         │
                         ▼
                    Preparing
                         │
                         ▼
                 Out for Delivery
                         │
                         ▼
                     Delivered
                         │
                         ▼
                      CUSTOMER
                         │
                         ▼
                  Order Completed
```

# 28. Recommended Navigation

### Customer Navbar

```text
Logo
Home
Shop
My Orders
Cart
Profile
Login / Account
```

### Admin Sidebar

```text
Dashboard
Orders
Products
Inventory
Customers
Payments
Analytics
Settings
Logout
```

# 29. Important Business Rules

1. **Customer cannot order an out-of-stock product.**
2. **Stock must be checked again at checkout**, not only when adding to cart.
3. **Order price must be stored at the time of purchase.**
4. Customer cannot modify an order after it reaches a certain processing stage.
5. Only admin can change product prices.
6. Only admin can update order status.
7. Customers can view only their own orders.
8. Admin can view all orders.
9. Payment must be verified server-side.
10. Cancelled orders should restore inventory when appropriate.
11. Every order must have a unique order number.
12. Every important order-status change should be recorded.

### 🎯 One-line architecture

**Customer → Products → Cart → Checkout → Payment → Order → Database → Admin → Order Processing → Inventory → Delivery → Customer Tracking**

Idi nee project ki **actual development blueprint** laga use cheyyachu. Next step lo ee flow base cheskoni **complete screen-by-screen UI flow + every page lo exact components + API flow** design cheyyadam best.
