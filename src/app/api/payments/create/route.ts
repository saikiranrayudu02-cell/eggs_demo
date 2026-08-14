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

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ success: false, message: 'Missing order ID' }, { status: 400 });
    }

    const data = db.read();
    const order = data.orders.find(o => o.id === orderId && o.userId === payload.userId);

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Return mock Razorpay Order details
    const mockRazorpayOrderId = `razorpay_order_${Math.random().toString(36).substr(2, 9)}`;

    db.transaction((tx) => {
      const paymentIndex = tx.payments.findIndex(p => p.orderId === orderId);
      if (paymentIndex > -1) {
        tx.payments[paymentIndex].providerOrderId = mockRazorpayOrderId;
        tx.payments[paymentIndex].updatedAt = new Date().toISOString();
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: mockRazorpayOrderId,
        amount: order.total * 100, // Razorpay uses paisa
        currency: 'INR',
        receipt: order.orderNumber
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
