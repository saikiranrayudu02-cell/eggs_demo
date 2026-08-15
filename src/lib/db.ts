import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { execSync, spawn } from 'child_process';

// Define the file path for the JSON database inside the workspace
const DB_FILE = path.join(process.cwd(), 'src/lib/db.json');

// Interface Definitions
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'CUSTOMER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  eggType: 'WHITE' | 'BROWN' | 'COUNTRY' | 'ORGANIC' | 'OTHER';
  packSize: number;
  price: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  id: number;
  productId: number;
  quantity: number;
  lowStockThreshold: number;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  addressId: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'COD';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export interface Payment {
  id: number;
  orderId: number;
  userId: number;
  provider: 'RAZORPAY' | 'COD';
  providerOrderId?: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  method?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  status: Order['orderStatus'];
  note: string;
  changedBy: number | null; // userId
  createdAt: string;
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  productId: number;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'ORDER_PLACED' | 'ORDER_CONFIRMED' | 'ORDER_PREPARING' | 'ORDER_OUT_FOR_DELIVERY' | 'ORDER_DELIVERED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'LOW_STOCK';
  isRead: boolean;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  addresses: Address[];
  products: Product[];
  inventory: Inventory[];
  carts: Cart[];
  orders: Order[];
  orderItems: OrderItem[];
  payments: Payment[];
  orderStatusHistory: OrderStatusHistory[];
  reviews: Review[];
  notifications: Notification[];
}

// Initial seed helper
function getSeedData(): DatabaseSchema {
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const customerPasswordHash = bcrypt.hashSync('customer123', 10);

  const initialProducts: Product[] = [
    {
      id: 1,
      name: 'Fresh White Eggs (Pack of 6)',
      slug: 'white-eggs-6',
      description: 'Daily fresh farm white eggs, packed with protein and essential nutrients.',
      eggType: 'WHITE',
      packSize: 6,
      price: 45,
      imageUrl: '/images/white-eggs-6.jpg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Fresh White Eggs (Pack of 12)',
      slug: 'white-eggs-12',
      description: 'Daily fresh farm white eggs, ideal size for a small family weekly supply.',
      eggType: 'WHITE',
      packSize: 12,
      price: 90,
      imageUrl: '/images/white-eggs-12.jpg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Fresh White Eggs (Pack of 30)',
      slug: 'white-eggs-30',
      description: 'Bulk tray of fresh farm white eggs. Best value for baking and large families.',
      eggType: 'WHITE',
      packSize: 30,
      price: 210,
      imageUrl: '/images/white-eggs-30.jpg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'Farm Brown Eggs (Pack of 6)',
      slug: 'brown-eggs-6',
      description: 'Premium brown shell eggs, naturally laid by cage-free hens.',
      eggType: 'BROWN',
      packSize: 6,
      price: 60,
      imageUrl: '/images/brown-eggs-6.jpg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      name: 'Farm Brown Eggs (Pack of 12)',
      slug: 'brown-eggs-12',
      description: 'Premium brown shell eggs, rich in golden yolk and delicious taste.',
      eggType: 'BROWN',
      packSize: 12,
      price: 115,
      imageUrl: '/images/brown-eggs-12.jpg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 6,
      name: 'Nutritious Country Eggs (Pack of 6)',
      slug: 'country-eggs-6',
      description: 'Traditional free-range country eggs (Nattu Kozhi Muttai) packed with rich taste.',
      eggType: 'COUNTRY',
      packSize: 6,
      price: 75,
      imageUrl: '/images/country-eggs-6.jpg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 7,
      name: 'Nutritious Country Eggs (Pack of 12)',
      slug: 'country-eggs-12',
      description: 'Traditional free-range country eggs, sourced directly from village farms.',
      eggType: 'COUNTRY',
      packSize: 12,
      price: 145,
      imageUrl: '/images/country-eggs-12.jpg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const initialInventory: Inventory[] = initialProducts.map((p) => ({
    id: p.id,
    productId: p.id,
    quantity: p.id === 6 ? 8 : 100, // Make Country Eggs 6-pack "Low Stock" immediately for demo
    lowStockThreshold: 10,
    updatedAt: new Date().toISOString(),
  }));

  return {
    users: [
      {
        id: 1,
        name: 'EggAdmin',
        email: 'admin@eggstore.com',
        phone: '9999999999',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Ravi Kumar',
        email: 'ravi@gmail.com',
        phone: '9876543210',
        passwordHash: customerPasswordHash,
        role: 'CUSTOMER',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    addresses: [
      {
        id: 1,
        userId: 2,
        fullName: 'Ravi Kumar',
        phone: '9876543210',
        house: 'Flat 402, Green Meadows',
        street: 'Koramangala 8th Block',
        area: 'Near Park',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560095',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    products: initialProducts,
    inventory: initialInventory,
    carts: [],
    orders: [],
    orderItems: [],
    payments: [],
    orderStatusHistory: [],
    reviews: [
      {
        id: 1,
        userId: 2,
        userName: 'Ravi Kumar',
        productId: 5,
        rating: 5,
        comment: 'Very fresh eggs! Perfect shell thickness and beautiful orange yolks.',
        isApproved: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    notifications: []
  };
}

// DB Class Service
class MySQLDatabase {
  private cache: DatabaseSchema | null = null;

  public read(): DatabaseSchema {
    if (this.cache) return this.cache;
    try {
      const syncScript = path.join(process.cwd(), 'src/lib/mysql_sync.js');
      const stdout = execSync(`node "${syncScript}"`, {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024
      });
      this.cache = JSON.parse(stdout);
      return this.cache!;
    } catch (e) {
      console.error('Error reading MySQL database, returning fallback JSON or seed data', e);
      if (fs.existsSync(DB_FILE)) {
        try {
          const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
          this.cache = JSON.parse(fileContent);
          return this.cache!;
        } catch (fileErr) {}
      }
      return getSeedData();
    }
  }

  public write(data: DatabaseSchema): void {
    this.cache = data;
    
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing fallback local JSON database', e);
    }

    try {
      const writeScript = path.join(/*turbopackIgnore: true*/ process.cwd(), 'src/lib/mysql_write.js');
      const child = spawn('node', [writeScript], {
        stdio: ['pipe', 'ignore', 'inherit'],
        env: { ...process.env }
      });
      child.stdin.write(JSON.stringify(data));
      child.stdin.end();
    } catch (e) {
      console.error('Error spawning MySQL write task', e);
    }
  }

  public transaction<T>(callback: (db: DatabaseSchema) => T): T {
    const db = this.read();
    const result = callback(db);
    this.write(db);
    return result;
  }
}

export const db = new MySQLDatabase();
