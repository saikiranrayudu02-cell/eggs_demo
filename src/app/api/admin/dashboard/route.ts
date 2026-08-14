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

    const totalOrders = data.orders.length;
    const pendingOrders = data.orders.filter(o => o.orderStatus === 'PENDING').length;
    
    // Today's orders
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaysOrders = data.orders.filter(o => o.createdAt.startsWith(todayStr)).length;

    // Total Customers
    const totalCustomers = data.users.filter(u => u.role === 'CUSTOMER').length;

    // Total Revenue (only PAID orders or COD orders that are DELIVERED)
    const totalRevenue = data.orders
      .filter(o => o.paymentStatus === 'PAID' || (o.paymentStatus === 'COD' && o.orderStatus === 'DELIVERED'))
      .reduce((sum, o) => sum + o.total, 0);

    // Low stock count
    const lowStockCount = data.inventory.filter(i => i.quantity <= i.lowStockThreshold).length;

    // Recent orders with customer names
    const recentOrders = [...data.orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(o => {
        const user = data.users.find(u => u.id === o.userId);
        return {
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: user ? user.name : 'Unknown',
          total: o.total,
          paymentStatus: o.paymentStatus,
          orderStatus: o.orderStatus,
          createdAt: o.createdAt
        };
      });

    // Low stock product details
    const lowStockProducts = data.inventory
      .filter(i => i.quantity <= i.lowStockThreshold)
      .map(i => {
        const prod = data.products.find(p => p.id === i.productId);
        return {
          id: i.productId,
          name: prod ? prod.name : 'Unknown Product',
          stock: i.quantity,
          threshold: i.lowStockThreshold
        };
      });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          pendingOrders,
          todaysOrders,
          totalCustomers,
          totalRevenue,
          lowStockCount
        },
        recentOrders,
        lowStockProducts
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
