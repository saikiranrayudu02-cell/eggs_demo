import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || ''; // PENDING, CONFIRMED, etc.

    const data = db.read();
    let filteredOrders = [...data.orders];

    if (status) {
      filteredOrders = filteredOrders.filter(o => o.orderStatus === status);
    }

    let results = filteredOrders.map(o => {
      const user = data.users.find(u => u.id === o.userId);
      const items = data.orderItems.filter(oi => oi.orderId === o.id);
      return {
        ...o,
        customerName: user ? user.name : 'Unknown',
        customerPhone: user ? user.phone : '',
        customerEmail: user ? user.email : '',
        items
      };
    });

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(r => 
        r.orderNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.includes(q)
      );
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: results });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
