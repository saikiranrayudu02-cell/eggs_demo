Yes Bittu 👍 **MySQL Workbench** use chestunnav kabatti PostgreSQL/Neon/Prisma-based schema kakunda, **MySQL database schema** ga design cheddam.

Nee project ki **MySQL Workbench lo direct ga create cheyyagalige database architecture** ila undali.

# 🥚 Egg Business — MySQL Backend Schema Documentation

## 1. Database

Database name:

```sql
egg_business
```

Overall structure:

```text
egg_business
│
├── users
├── addresses
├── products
├── inventory
├── carts
├── cart_items
├── orders
├── order_items
├── payments
├── order_status_history
├── reviews
└── notifications
```

---

# 2. Database Relationships

```text
                         users
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
         addresses       carts         orders
                           │             │
                           ▼             ▼
                       cart_items    order_items
                           │             │
                           └──────┬──────┘
                                  ▼
                               products
                                  │
                                  ▼
                              inventory

orders
  │
  ├──────────────► payments
  │
  └──────────────► order_status_history

users
  │
  ├──────────────► reviews ──────► products
  │
  └──────────────► notifications
```

---

# 3. `users` Table

This table stores both customers and admins.

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CUSTOMER', 'ADMIN') DEFAULT 'CUSTOMER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);
```

### Example

| id | name  | email                                   | role     |
| -: | ----- | --------------------------------------- | -------- |
|  1 | Ravi  | [ravi@gmail.com](mailto:ravi@gmail.com) | CUSTOMER |
|  2 | Admin | [admin@egg.com](mailto:admin@egg.com)   | ADMIN    |

---

# 4. `addresses` Table

Customer delivery addresses.

```sql
CREATE TABLE addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    house VARCHAR(100) NOT NULL,
    street VARCHAR(150),
    area VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_addresses_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
```

### Relationship

```text
users 1 ─────────── N addresses
```

---

# 5. `products` Table

This stores all egg products.

```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    description TEXT,
    egg_type ENUM(
        'WHITE',
        'BROWN',
        'COUNTRY',
        'ORGANIC',
        'OTHER'
    ) NOT NULL,
    pack_size INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);
```

Example:

| id | name         | egg_type | pack_size | price |
| -: | ------------ | -------- | --------: | ----: |
|  1 | White Eggs   | WHITE    |        12 |    90 |
|  2 | Brown Eggs   | BROWN    |        12 |   115 |
|  3 | Country Eggs | COUNTRY  |        12 |   145 |

---

# 6. `inventory` Table

Stock management.

```sql
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL UNIQUE,
    quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 10,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);
```

Example:

```text
Brown Eggs
Stock = 120
Low Stock Threshold = 20
```

When:

```text
quantity <= low_stock_threshold
```

Admin dashboard should show:

**⚠️ Low Stock**

---

# 7. `carts` Table

Each customer can have one active cart.

```sql
CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_carts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
```

Relationship:

```text
users 1 ─────────── 1 carts
```

---

# 8. `cart_items` Table

Products inside the cart.

```sql
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id)
        REFERENCES carts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    UNIQUE KEY unique_cart_product (cart_id, product_id)
);
```

Example:

```text
Cart #1

Brown Eggs × 2
Country Eggs × 1
```

---

# 9. `orders` Table

This is the **main business table**.

```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_number VARCHAR(50) NOT NULL UNIQUE,

    user_id INT NOT NULL,
    address_id INT NOT NULL,

    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    discount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,

    payment_status ENUM(
        'PENDING',
        'PAID',
        'FAILED',
        'REFUNDED',
        'COD'
    ) DEFAULT 'PENDING',

    order_status ENUM(
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED'
    ) DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_orders_address
        FOREIGN KEY (address_id)
        REFERENCES addresses(id)
);
```

---

# 10. `order_items` Table

Products purchased in an order.

**Important:** We store the price at the time of purchase.

```sql
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,
    product_id INT NOT NULL,

    product_name VARCHAR(150) NOT NULL,

    quantity INT NOT NULL,

    unit_price DECIMAL(10,2) NOT NULL,

    total_price DECIMAL(10,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
);
```

### Why `product_name` and `unit_price`?

Suppose today:

```text
Brown Eggs = ₹115
```

Customer purchases 2.

Tomorrow admin changes:

```text
Brown Eggs = ₹130
```

The old order should still display:

```text
Brown Eggs × 2
₹115 each
₹230 total
```

So historical order data remains correct.

---

# 11. `payments` Table

For Razorpay + COD.

```sql
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,
    user_id INT NOT NULL,

    provider ENUM(
        'RAZORPAY',
        'COD'
    ) NOT NULL,

    provider_order_id VARCHAR(150),
    provider_payment_id VARCHAR(150),

    amount DECIMAL(10,2) NOT NULL,

    currency VARCHAR(10) DEFAULT 'INR',

    status ENUM(
        'PENDING',
        'SUCCESS',
        'FAILED',
        'REFUNDED'
    ) DEFAULT 'PENDING',

    method VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id),

    CONSTRAINT fk_payments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);
```

---

# 12. `order_status_history` Table

This records every order status change.

```sql
CREATE TABLE order_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    status ENUM(
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED'
    ) NOT NULL,

    note VARCHAR(255),

    changed_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_status_history_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_status_history_user
        FOREIGN KEY (changed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);
```

Example:

```text
ORD00125

10:00 → PENDING
10:05 → CONFIRMED
10:20 → PREPARING
11:10 → OUT_FOR_DELIVERY
12:00 → DELIVERED
```

---

# 13. `reviews` Table

Optional but useful.

```sql
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    product_id INT NOT NULL,

    rating INT NOT NULL,

    comment TEXT,

    is_approved BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reviews_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT check_rating
        CHECK (rating BETWEEN 1 AND 5)
);
```

---

# 14. `notifications` Table

```sql
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    title VARCHAR(150) NOT NULL,

    message TEXT NOT NULL,

    type ENUM(
        'ORDER_PLACED',
        'ORDER_CONFIRMED',
        'ORDER_PREPARING',
        'ORDER_OUT_FOR_DELIVERY',
        'ORDER_DELIVERED',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'LOW_STOCK'
    ) NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
```

---

# 15. Complete MySQL ER Structure

In **MySQL Workbench → Model → Create EER Diagram**, your diagram should approximately look like:

```text
                     ┌──────────────┐
                     │    USERS     │
                     ├──────────────┤
                     │ PK id        │
                     │ name         │
                     │ email        │
                     │ phone        │
                     │ role         │
                     └──────┬───────┘
                            │
            ┌───────────────┼─────────────────┐
            │               │                 │
            ▼               ▼                 ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  ADDRESSES   │ │    CARTS     │ │    ORDERS    │
    └──────────────┘ └──────┬───────┘ └──────┬───────┘
                            │                │
                            ▼                ├──────────────┐
                     ┌──────────────┐        │              │
                     │  CART_ITEMS  │        ▼              ▼
                     └──────┬───────┘  ┌────────────┐ ┌────────────┐
                            │           │ORDER_ITEMS │ │  PAYMENTS  │
                            │           └─────┬──────┘ └────────────┘
                            │                 │
                            └────────┬────────┘
                                     ▼
                              ┌──────────────┐
                              │   PRODUCTS   │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  INVENTORY   │
                              └──────────────┘

ORDERS ───────────► ORDER_STATUS_HISTORY

USERS ────────────► REVIEWS ───────────► PRODUCTS

USERS ────────────► NOTIFICATIONS
```

---

# 16. Complete Customer Order Flow in MySQL

When customer places an order:

```text
Customer
   ↓
users
   ↓
carts
   ↓
cart_items
   ↓
products
   ↓
inventory check
   ↓
orders
   ↓
order_items
   ↓
payments
   ↓
order_status_history
   ↓
notifications
```

---

# 17. Example Real Order

Customer:

```text
Ravi
```

Cart:

```text
Brown Eggs × 2
Country Eggs × 1
```

Products:

```text
Brown Eggs = ₹115
Country Eggs = ₹145
```

Backend creates:

### `orders`

```text
order_number = ORD-20260814-0001
subtotal = 375
delivery_fee = 30
discount = 0
total = 405
payment_status = COD
order_status = PENDING
```

### `order_items`

```text
Brown Eggs
quantity = 2
unit_price = 115
total_price = 230

Country Eggs
quantity = 1
unit_price = 145
total_price = 145
```

### `payments`

```text
provider = COD
amount = 405
status = PENDING
```

### `order_status_history`

```text
PENDING
```

---

# 18. Admin Order Update

Admin clicks:

**Confirm Order**

Database:

```text
orders.order_status
        ↓
CONFIRMED
```

And insert:

```text
order_status_history

order_id = 1
status = CONFIRMED
changed_by = admin_id
```

Customer sees:

```text
🟢 Order Confirmed
```

---

# 19. Stock Management

Suppose:

```text
Brown Eggs stock = 100
```

Customer orders:

```text
2
```

After successful order:

```text
100 - 2 = 98
```

Database:

```sql
UPDATE inventory
SET quantity = quantity - 2
WHERE product_id = 1;
```

But in the actual backend, this should happen inside a **transaction with a stock check** to prevent two customers from accidentally buying the same last units.

---

# 20. MySQL Workbench Workflow

Since you're using MySQL Workbench, do this:

```text
MySQL Workbench
       ↓
Create Connection
       ↓
Create Schema
       ↓
egg_business
       ↓
Create Tables
       ↓
Set Primary Keys
       ↓
Set Foreign Keys
       ↓
Create Indexes
       ↓
Create EER Diagram
       ↓
Connect Backend
```

---

# 21. Recommended Backend Stack With MySQL

For your project, I'd use:

```text
Frontend
   ↓
Next.js + TypeScript
   ↓
Backend
   ↓
Node.js + Express
   ↓
ORM
   ↓
Prisma
   ↓
MySQL
   ↓
MySQL Workbench
```

So:

**MySQL Workbench is your database management/design tool.**

**MySQL is the actual database.**

**Prisma is the layer your Node.js backend uses to communicate with MySQL.**

You don't need PostgreSQL or Neon for this version.

---

# 22. Final Database Tables

Your MVP database should have these **12 tables**:

```text
1.  users
2.  addresses
3.  products
4.  inventory
5.  carts
6.  cart_items
7.  orders
8.  order_items
9.  payments
10. order_status_history
11. reviews
12. notifications
```

### ⭐ Most important tables

If you're building the first working version, start with:

```text
users
   ↓
products
   ↓
inventory
   ↓
cart
   ↓
cart_items
   ↓
orders
   ↓
order_items
   ↓
payments
```

Then add:

```text
addresses
order_status_history
reviews
notifications
```

This structure will fit your **customer ordering + admin order management** idea very well and can be directly visualized in **MySQL Workbench's EER diagram**.
