import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { status, note } = await request.json();
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid order status' }, { status: 400 });
    }

    const updatedOrder = db.transaction((data) => {
      const orderIndex = data.orders.findIndex(o => o.id === orderId);
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }

      const order = data.orders[orderIndex];
      const oldStatus = order.orderStatus;
      
      // If order is already in target status, do nothing
      if (oldStatus === status) {
        return order;
      }

      // Update status
      order.orderStatus = status as any;
      order.updatedAt = new Date().toISOString();

      // Business Rule: If delivered, check and update COD payment status
      if (status === 'DELIVERED') {
        const paymentIndex = data.payments.findIndex(p => p.orderId === orderId);
        if (paymentIndex > -1) {
          data.payments[paymentIndex].status = 'SUCCESS';
          data.payments[paymentIndex].updatedAt = new Date().toISOString();
        }
        if (order.paymentStatus === 'COD') {
          order.paymentStatus = 'PAID';
        }
      }

      // Business Rule: If CANCELLED, restore inventory
      if (status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
        const orderItems = data.orderItems.filter(item => item.orderId === orderId);
        for (const item of orderItems) {
          const invIndex = data.inventory.findIndex(inv => inv.productId === item.productId);
          if (invIndex > -1) {
            data.inventory[invIndex].quantity += item.quantity;
            data.inventory[invIndex].updatedAt = new Date().toISOString();
          }
        }
        // Mark payment as refunded if it was paid
        if (order.paymentStatus === 'PAID') {
          order.paymentStatus = 'REFUNDED';
          const paymentIndex = data.payments.findIndex(p => p.orderId === orderId);
          if (paymentIndex > -1) {
            data.payments[paymentIndex].status = 'REFUNDED';
            data.payments[paymentIndex].updatedAt = new Date().toISOString();
          }
        }
      }

      // Log status history
      const historyId = data.orderStatusHistory.length > 0 ? Math.max(...data.orderStatusHistory.map(h => h.id)) + 1 : 1;
      data.orderStatusHistory.push({
        id: historyId,
        orderId: order.id,
        status: status as any,
        note: note || `Order status updated to ${status}.`,
        changedBy: payload.userId,
        createdAt: new Date().toISOString()
      });

      // Customer notification
      const userNotifId = data.notifications.length > 0 ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1;
      let title = `📦 Order Status Update: ${status}`;
      let message = `Your order ${order.orderNumber} has been updated to ${status}.`;

      if (status === 'CONFIRMED') {
        title = '👍 Order Confirmed';
        message = `Your order ${order.orderNumber} is confirmed and being processed.`;
      } else if (status === 'PREPARING') {
        title = '🥚 Preparing Your Eggs';
        message = `We are fresh-packing your eggs for order ${order.orderNumber}.`;
      } else if (status === 'OUT_FOR_DELIVERY') {
        title = '🚚 Out for Delivery';
        message = `Your order ${order.orderNumber} is out for delivery. Keep your phone handy!`;
      } else if (status === 'DELIVERED') {
        title = '🎉 Delivered Successfully';
        message = `Your order ${order.orderNumber} has been delivered. Enjoy your fresh eggs!`;
      } else if (status === 'CANCELLED') {
        title = '❌ Order Cancelled';
        message = `Your order ${order.orderNumber} has been cancelled.`;
      }

      data.notifications.push({
        id: userNotifId,
        userId: order.userId,
        title,
        message,
        type: status === 'CONFIRMED' ? 'ORDER_CONFIRMED' : 
              status === 'PREPARING' ? 'ORDER_PREPARING' :
              status === 'OUT_FOR_DELIVERY' ? 'ORDER_OUT_FOR_DELIVERY' :
              status === 'DELIVERED' ? 'ORDER_DELIVERED' : 'ORDER_PLACED',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      return order;
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || 'Server error' }, { status: 400 });
  }
}
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const data = db.read();
    
    // Find order
    const order = data.orders.find(o => o.id === orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Get order items
    const items = data.orderItems.filter(item => item.orderId === order.id);

    // Get delivery address details
    const address = data.addresses.find(addr => addr.id === order.addressId);

    // Get status history timeline
    const statusHistory = data.orderStatusHistory
      .filter(h => h.orderId === order.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Get payment record
    const payment = data.payments.find(p => p.orderId === order.id);

    // Get customer details
    const customer = data.users.find(u => u.id === order.userId);

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        items,
        address,
        statusHistory,
        payment,
        customerName: customer ? customer.name : 'Unknown',
        customerPhone: customer ? customer.phone : '',
        customerEmail: customer ? customer.email : ''
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
