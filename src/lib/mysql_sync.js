const mysql = require('mysql2/promise');

// Load environment variables manually in case they are not loaded yet
// Next.js automatically loads .env.local, but for child process we support env or fallback
const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_DATABASE || 'eggs_demo';

async function main() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database
    });

    const formatTime = (t) => {
      if (!t) return new Date().toISOString();
      return new Date(t).toISOString();
    };

    // 1. Fetch users
    const [usersRows] = await connection.query('SELECT * FROM users');
    const users = usersRows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      passwordHash: row.password_hash,
      role: row.role,
      isActive: Boolean(row.is_active),
      createdAt: formatTime(row.created_at),
      updatedAt: formatTime(row.updated_at)
    }));

    // 2. Fetch addresses
    const [addressesRows] = await connection.query('SELECT * FROM addresses');
    const addresses = addressesRows.map(row => ({
      id: row.id,
      userId: row.user_id,
      fullName: row.full_name,
      phone: row.phone,
      house: row.house,
      street: row.street || '',
      area: row.area || '',
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      isDefault: Boolean(row.is_default),
      createdAt: formatTime(row.created_at),
      updatedAt: formatTime(row.updated_at)
    }));

    // 3. Fetch products
    const [productsRows] = await connection.query('SELECT * FROM products');
    const products = productsRows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || '',
      eggType: row.egg_type,
      packSize: row.pack_size,
      price: Number(row.price),
      imageUrl: row.image_url || '',
      isActive: Boolean(row.is_active),
      createdAt: formatTime(row.created_at),
      updatedAt: formatTime(row.updated_at)
    }));

    // 4. Fetch inventory
    const [inventoryRows] = await connection.query('SELECT * FROM inventory');
    const inventory = inventoryRows.map(row => ({
      id: row.id,
      productId: row.product_id,
      quantity: row.quantity,
      lowStockThreshold: row.low_stock_threshold,
      updatedAt: formatTime(row.updated_at)
    }));

    // 5. Fetch cart items & carts
    const [cartsRows] = await connection.query('SELECT * FROM carts');
    const [cartItemsRows] = await connection.query('SELECT * FROM cart_items');
    const carts = cartsRows.map(cRow => {
      const items = cartItemsRows
        .filter(ciRow => ciRow.cart_id === cRow.id)
        .map(ciRow => ({
          id: ciRow.id,
          cartId: ciRow.cart_id,
          productId: ciRow.product_id,
          quantity: ciRow.quantity,
          createdAt: formatTime(ciRow.created_at),
          updatedAt: formatTime(ciRow.updated_at)
        }));
      return {
        id: cRow.id,
        userId: cRow.user_id,
        items,
        createdAt: formatTime(cRow.created_at),
        updatedAt: formatTime(cRow.updated_at)
      };
    });

    // 6. Fetch orders
    const [ordersRows] = await connection.query('SELECT * FROM orders');
    const orders = ordersRows.map(row => ({
      id: row.id,
      orderNumber: row.order_number,
      userId: row.user_id,
      addressId: row.address_id,
      subtotal: Number(row.subtotal),
      deliveryFee: Number(row.delivery_fee),
      discount: Number(row.discount),
      total: Number(row.total),
      paymentStatus: row.payment_status,
      orderStatus: row.order_status,
      createdAt: formatTime(row.created_at),
      updatedAt: formatTime(row.updated_at)
    }));

    // 7. Fetch order items
    const [orderItemsRows] = await connection.query('SELECT * FROM order_items');
    const orderItems = orderItemsRows.map(row => ({
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      productName: row.product_name,
      quantity: row.quantity,
      unitPrice: Number(row.unit_price),
      totalPrice: Number(row.total_price),
      createdAt: formatTime(row.created_at)
    }));

    // 8. Fetch payments
    const [paymentsRows] = await connection.query('SELECT * FROM payments');
    const payments = paymentsRows.map(row => ({
      id: row.id,
      orderId: row.order_id,
      userId: row.user_id,
      provider: row.provider,
      providerOrderId: row.provider_order_id || undefined,
      providerPaymentId: row.provider_payment_id || undefined,
      amount: Number(row.amount),
      currency: row.currency,
      status: row.status,
      method: row.method || undefined,
      createdAt: formatTime(row.created_at),
      updatedAt: formatTime(row.updated_at)
    }));

    // 9. Fetch order status history
    const [oshRows] = await connection.query('SELECT * FROM order_status_history');
    const orderStatusHistory = oshRows.map(row => ({
      id: row.id,
      orderId: row.order_id,
      status: row.status,
      note: row.note || '',
      changedBy: row.changed_by,
      createdAt: formatTime(row.created_at)
    }));

    // 10. Fetch reviews (join users to get user_name)
    const [reviewsRows] = await connection.query(`
      SELECT r.*, u.name AS user_name 
      FROM reviews r 
      LEFT JOIN users u ON r.user_id = u.id
    `);
    const reviews = reviewsRows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name || 'Deleted User',
      productId: row.product_id,
      rating: row.rating,
      comment: row.comment || '',
      isApproved: Boolean(row.is_approved),
      createdAt: formatTime(row.created_at),
      updatedAt: formatTime(row.updated_at)
    }));

    // 11. Fetch notifications
    const [notificationsRows] = await connection.query('SELECT * FROM notifications');
    const notifications = notificationsRows.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      message: row.message,
      type: row.type,
      isRead: Boolean(row.is_read),
      createdAt: formatTime(row.created_at)
    }));

    const result = {
      users,
      addresses,
      products,
      inventory,
      carts,
      orders,
      orderItems,
      payments,
      orderStatusHistory,
      reviews,
      notifications
    };

    console.log(JSON.stringify(result));
  } catch (error) {
    console.error('MySQL sync error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();
