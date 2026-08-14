import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, success } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    }

    if (success === false) {
      // Simulate payment failure
      db.transaction((data) => {
        const paymentIndex = data.payments.findIndex(p => p.providerOrderId === razorpay_order_id);
        if (paymentIndex > -1) {
          data.payments[paymentIndex].status = 'FAILED';
          data.payments[paymentIndex].providerPaymentId = razorpay_payment_id;
          data.payments[paymentIndex].updatedAt = new Date().toISOString();

          const order = data.orders.find(o => o.id === data.payments[paymentIndex].orderId);
          if (order) {
            order.paymentStatus = 'FAILED';
            order.updatedAt = new Date().toISOString();
          }
        }
      });
      return NextResponse.json({ success: false, message: 'Payment failed' });
    }

    // Success flow
    const updatedOrder = db.transaction((data) => {
      const paymentIndex = data.payments.findIndex(p => p.providerOrderId === razorpay_order_id);
      if (paymentIndex === -1) {
        throw new Error('Payment transaction not found');
      }

      const payment = data.payments[paymentIndex];
      payment.status = 'SUCCESS';
      payment.providerPaymentId = razorpay_payment_id;
      payment.method = 'MOCK_CARD';
      payment.updatedAt = new Date().toISOString();

      const orderIndex = data.orders.findIndex(o => o.id === payment.orderId);
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }

      const order = data.orders[orderIndex];
      order.paymentStatus = 'PAID';
      order.orderStatus = 'CONFIRMED';
      order.updatedAt = new Date().toISOString();

      // Log status history
      const historyId = data.orderStatusHistory.length > 0 ? Math.max(...data.orderStatusHistory.map(h => h.id)) + 1 : 1;
      data.orderStatusHistory.push({
        id: historyId,
        orderId: order.id,
        status: 'CONFIRMED',
        note: 'Payment verified. Order confirmed.',
        changedBy: null, // system verified
        createdAt: new Date().toISOString()
      });

      // User notification
      const userNotifId = data.notifications.length > 0 ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1;
      data.notifications.push({
        id: userNotifId,
        userId: order.userId,
        title: '👍 Payment Verified & Order Confirmed',
        message: `Your payment for order ${order.orderNumber} succeeded. Order status: CONFIRMED.`,
        type: 'ORDER_CONFIRMED',
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
