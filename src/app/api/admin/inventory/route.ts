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
    const inventoryList = data.inventory.map(inv => {
      const product = data.products.find(p => p.id === inv.productId);
      return {
        id: inv.id,
        productId: inv.productId,
        name: product ? product.name : 'Unknown Product',
        eggType: product ? product.eggType : 'OTHER',
        packSize: product ? product.packSize : 0,
        price: product ? product.price : 0,
        quantity: inv.quantity,
        lowStockThreshold: inv.lowStockThreshold,
        updatedAt: inv.updatedAt,
        status: inv.quantity <= 0 ? '🔴 Out of Stock' :
                inv.quantity <= inv.lowStockThreshold ? '🟡 Low Stock' : '🟢 Healthy'
      };
    });

    return NextResponse.json({ success: true, data: inventoryList });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { productId, quantity } = await request.json();
    if (productId === undefined || quantity === undefined || quantity < 0) {
      return NextResponse.json({ success: false, message: 'Invalid product ID or stock quantity' }, { status: 400 });
    }

    const updated = db.transaction((data) => {
      const invIndex = data.inventory.findIndex(inv => inv.productId === productId);
      if (invIndex === -1) {
        throw new Error('Inventory record not found');
      }

      data.inventory[invIndex].quantity = parseInt(quantity);
      data.inventory[invIndex].updatedAt = new Date().toISOString();

      return data.inventory[invIndex];
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || 'Server error' }, { status: 400 });
  }
}
