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
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const data = db.read();
    
    const customers = data.users
      .filter(u => u.role === 'CUSTOMER')
      .map(c => {
        const userOrders = data.orders.filter(o => o.userId === c.id);
        const orderCount = userOrders.length;
        
        // Only sum revenue from PAID orders or COD DELIVERED orders
        const spending = userOrders
          .filter(o => o.paymentStatus === 'PAID' || (o.paymentStatus === 'COD' && o.orderStatus === 'DELIVERED'))
          .reduce((sum, o) => sum + o.total, 0);

        return {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          isActive: c.isActive,
          createdAt: c.createdAt,
          orderCount,
          spending
        };
      });

    return NextResponse.json({ success: true, data: customers });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
