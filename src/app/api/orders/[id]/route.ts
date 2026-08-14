import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });

    const data = db.read();
    
    // Find order
    const order = data.orders.find(o => o.id === orderId);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Verify ownership (or Admin role)
    if (order.userId !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 403 });
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

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        items,
        address,
        statusHistory,
        payment
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
