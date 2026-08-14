import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });

    const data = db.read();
    
    // Get user orders sorted by date (newest first)
    const userOrders = data.orders
      .filter(o => o.userId === payload.userId)
      .map(order => {
        const items = data.orderItems.filter(item => item.orderId === order.id);
        return {
          ...order,
          items
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: userOrders });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });

    const { addressId, paymentMethod } = await request.json();
    if (!addressId || !paymentMethod || !['COD', 'ONLINE'].includes(paymentMethod)) {
      return NextResponse.json({ success: false, message: 'Invalid address or payment method' }, { status: 400 });
    }

    const result = db.transaction((data) => {
      // 1. Verify Address
      const address = data.addresses.find(addr => addr.id === addressId && addr.userId === payload.userId);
      if (!address) {
        throw new Error('Delivery address not found');
      }

      // 2. Retrieve Cart
      const cartIndex = data.carts.findIndex(c => c.userId === payload.userId);
      if (cartIndex === -1 || data.carts[cartIndex].items.length === 0) {
        throw new Error('Your cart is empty');
      }

      const cart = data.carts[cartIndex];

      // 3. Check Stock for all items
      const itemsToBuy = [];
      let subtotal = 0;

      for (const cartItem of cart.items) {
        const product = data.products.find(p => p.id === cartItem.productId && p.isActive);
        if (!product) {
          throw new Error('One of the products in your cart is no longer active');
        }

        const inventoryIndex = data.inventory.findIndex(inv => inv.productId === cartItem.productId);
        if (inventoryIndex === -1 || data.inventory[inventoryIndex].quantity < cartItem.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${inventoryIndex > -1 ? data.inventory[inventoryIndex].quantity : 0}`);
        }

        subtotal += product.price * cartItem.quantity;
        itemsToBuy.push({
          cartItem,
          product,
          inventoryIndex
        });
      }

      // 4. Calculate final values (Delivery rules: free above ₹300, else ₹30)
      const deliveryFee = subtotal >= 300 ? 0 : 30;
      const discount = 0;
      const total = subtotal + deliveryFee - discount;

      // 5. Generate unique Order Number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      const randSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit rand
      const orderNumber = `ORD-${dateStr}-${randSuffix}`;

      // 6. Create Order
      const newOrderId = data.orders.length > 0 ? Math.max(...data.orders.map(o => o.id)) + 1 : 1;
      const newOrder: any = {
        id: newOrderId,
        orderNumber,
        userId: payload.userId,
        addressId,
        subtotal,
        deliveryFee,
        discount,
        total,
        paymentStatus: paymentMethod === 'COD' ? 'COD' : 'PENDING',
        orderStatus: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      data.orders.push(newOrder);

      // 7. Create Order Items & Update Inventory
      for (const { cartItem, product, inventoryIndex } of itemsToBuy) {
        // Decrease stock
        data.inventory[inventoryIndex].quantity -= cartItem.quantity;
        data.inventory[inventoryIndex].updatedAt = new Date().toISOString();

        // Check if low stock threshold crossed
        if (data.inventory[inventoryIndex].quantity <= data.inventory[inventoryIndex].lowStockThreshold) {
          const notifId = data.notifications.length > 0 ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1;
          data.notifications.push({
            id: notifId,
            userId: 1, // Admin (User ID 1)
            title: '⚠️ Low Stock Alert',
            message: `${product.name} stock is low: only ${data.inventory[inventoryIndex].quantity} remaining.`,
            type: 'LOW_STOCK',
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }

        // Add Order Item
        const newOrderItemId = data.orderItems.length > 0 ? Math.max(...data.orderItems.map(oi => oi.id)) + 1 : 1;
        data.orderItems.push({
          id: newOrderItemId,
          orderId: newOrderId,
          productId: product.id,
          productName: product.name,
          quantity: cartItem.quantity,
          unitPrice: product.price,
          totalPrice: product.price * cartItem.quantity,
          createdAt: new Date().toISOString()
        });
      }

      // 8. Create Payment Record
      const newPaymentId = data.payments.length > 0 ? Math.max(...data.payments.map(p => p.id)) + 1 : 1;
      data.payments.push({
        id: newPaymentId,
        orderId: newOrderId,
        userId: payload.userId,
        provider: paymentMethod,
        amount: total,
        currency: 'INR',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // 9. Log Status History
      const statusHistoryId = data.orderStatusHistory.length > 0 ? Math.max(...data.orderStatusHistory.map(h => h.id)) + 1 : 1;
      data.orderStatusHistory.push({
        id: statusHistoryId,
        orderId: newOrderId,
        status: 'PENDING',
        note: 'Order placed successfully.',
        changedBy: payload.userId,
        createdAt: new Date().toISOString()
      });

      // 10. Add Notification for User
      const userNotifId = data.notifications.length > 0 ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1;
      data.notifications.push({
        id: userNotifId,
        userId: payload.userId,
        title: '🎉 Order Placed Successfully',
        message: `Your order ${orderNumber} has been placed. Current status: PENDING.`,
        type: 'ORDER_PLACED',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // 11. Clear Cart
      data.carts[cartIndex].items = [];
      data.carts[cartIndex].updatedAt = new Date().toISOString();

      return newOrder;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || 'Server error' }, { status: 400 });
  }
}
