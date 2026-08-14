const mysql = require('mysql2/promise');

const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_DATABASE || 'eggs_demo';

// Read JSON data from stdin
let inputData = '';
process.stdin.on('data', chunk => {
  inputData += chunk;
});

process.stdin.on('end', async () => {
  let connection;
  try {
    const data = JSON.parse(inputData);
    
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database
    });

    // Disable foreign keys temporarily
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Truncate tables
    const tables = [
      'notifications',
      'reviews',
      'order_status_history',
      'payments',
      'order_items',
      'orders',
      'cart_items',
      'carts',
      'inventory',
      'products',
      'addresses',
      'users'
    ];

    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
    }

    const formatSQLTime = (isoString) => {
      if (!isoString) return null;
      try {
        const d = new Date(isoString);
        return d.toISOString().replace('T', ' ').substring(0, 19);
      } catch (e) {
        return null;
      }
    };

    // Helper for parameterized query execution
    const insertRow = async (table, cols, vals) => {
      const placeholders = cols.map(() => '?').join(', ');
      const query = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`;
      await connection.query(query, vals);
    };

    // 1. users
    if (data.users && data.users.length > 0) {
      for (const item of data.users) {
        await insertRow('users', 
          ['id', 'name', 'email', 'phone', 'password_hash', 'role', 'is_active', 'created_at', 'updated_at'],
          [item.id, item.name, item.email, item.phone, item.passwordHash, item.role, item.isActive ? 1 : 0, formatSQLTime(item.createdAt), formatSQLTime(item.updatedAt)]
        );
      }
    }

    // 2. addresses
    if (data.addresses && data.addresses.length > 0) {
      for (const item of data.addresses) {
        await insertRow('addresses',
          ['id', 'user_id', 'full_name', 'phone', 'house', 'street', 'area', 'city', 'state', 'pincode', 'is_default', 'created_at', 'updated_at'],
          [item.id, item.userId, item.fullName, item.phone, item.house, item.street || null, item.area || null, item.city, item.state, item.pincode, item.isDefault ? 1 : 0, formatSQLTime(item.createdAt), formatSQLTime(item.updatedAt)]
        );
      }
    }

    // 3. products
    if (data.products && data.products.length > 0) {
      for (const item of data.products) {
        await insertRow('products',
          ['id', 'name', 'slug', 'description', 'egg_type', 'pack_size', 'price', 'image_url', 'is_active', 'created_at', 'updated_at'],
          [item.id, item.name, item.slug, item.description || null, item.eggType, item.packSize, item.price, item.imageUrl || null, item.isActive ? 1 : 0, formatSQLTime(item.createdAt), formatSQLTime(item.updatedAt)]
        );
      }
    }

    // 4. inventory
    if (data.inventory && data.inventory.length > 0) {
      for (const item of data.inventory) {
        await insertRow('inventory',
          ['id', 'product_id', 'quantity', 'low_stock_threshold', 'updated_at'],
          [item.id, item.productId, item.quantity, item.lowStockThreshold, formatSQLTime(item.updatedAt)]
        );
      }
    }

    // 5. carts & cart_items
    if (data.carts && data.carts.length > 0) {
      let cartItemCounter = 1;
      for (const item of data.carts) {
        await insertRow('carts',
          ['id', 'user_id', 'created_at', 'updated_at'],
          [item.id, item.userId, formatSQLTime(item.createdAt), formatSQLTime(item.updatedAt)]
        );
        if (item.items && item.items.length > 0) {
          for (const ci of item.items) {
            await insertRow('cart_items',
              ['id', 'cart_id', 'product_id', 'quantity', 'created_at', 'updated_at'],
              [cartItemCounter++, item.id, ci.productId, ci.quantity, formatSQLTime(ci.createdAt || item.createdAt), formatSQLTime(ci.updatedAt || item.updatedAt)]
            );
          }
        }
      }
    }

    // 6. orders
    if (data.orders && data.orders.length > 0) {
      for (const item of data.orders) {
        await insertRow('orders',
          ['id', 'order_number', 'user_id', 'address_id', 'subtotal', 'delivery_fee', 'discount', 'total', 'payment_status', 'order_status', 'created_at', 'updated_at'],
          [item.id, item.orderNumber, item.userId, item.addressId, item.subtotal, item.deliveryFee || 0, item.discount || 0, item.total, item.paymentStatus, item.orderStatus, formatSQLTime(item.createdAt), formatSQLTime(item.updatedAt)]
        );
      }
    }

    // 7. order_items
    if (data.orderItems && data.orderItems.length > 0) {
      for (const item of data.orderItems) {
        await insertRow('order_items',
          ['id', 'order_id', 'product_id', 'product_name', 'quantity', 'unit_price', 'total_price', 'created_at'],
          [item.id, item.orderId, item.productId, item.productName, item.quantity, item.unitPrice, item.totalPrice, formatSQLTime(item.createdAt)]
        );
      }
    }

    // 8. payments
    if (data.payments && data.payments.length > 0) {
      for (const item of data.payments) {
        await insertRow('payments',
          ['id', 'order_id', 'user_id', 'provider', 'provider_order_id', 'provider_payment_id', 'amount', 'currency', 'status', 'method', 'created_at', 'updated_at'],
          [item.id, item.orderId, item.userId, item.provider, item.providerOrderId || null, item.providerPaymentId || null, item.amount, item.currency || 'INR', item.status, item.method || null, formatSQLTime(item.createdAt), formatSQLTime(item.updatedAt)]
        );
      }
    }

    // 9. order_status_history
    if (data.orderStatusHistory && data.orderStatusHistory.length > 0) {
      for (const item of data.orderStatusHistory) {
        await insertRow('order_status_history',
          ['id', 'order_id', 'status', 'note', 'changed_by', 'created_at'],
          [item.id, item.orderId, item.status, item.note || null, item.changedBy, formatSQLTime(item.createdAt)]
        );
      }
    }

    // 10. reviews
    if (data.reviews && data.reviews.length > 0) {
      for (const item of data.reviews) {
        await insertRow('reviews',
          ['id', 'user_id', 'product_id', 'rating', 'comment', 'is_approved', 'created_at', 'updated_at'],
          [item.id, item.userId, item.productId, item.rating, item.comment || null, item.isApproved ? 1 : 0, formatSQLTime(item.createdAt), formatSQLTime(item.updatedAt)]
        );
      }
    }

    // 11. notifications
    if (data.notifications && data.notifications.length > 0) {
      for (const item of data.notifications) {
        await insertRow('notifications',
          ['id', 'user_id', 'title', 'message', 'type', 'is_read', 'created_at'],
          [item.id, item.userId, item.title, item.message, item.type, item.isRead ? 1 : 0, formatSQLTime(item.createdAt)]
        );
      }
    }

    // Re-enable foreign keys
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Successfully updated MySQL database');
    process.exit(0);
  } catch (error) {
    console.error('MySQL write error:', error);
    if (connection) {
      try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      } catch (err) {}
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});
