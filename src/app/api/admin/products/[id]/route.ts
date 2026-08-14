import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, eggType, packSize, price, stock, lowStockThreshold, imageUrl, isActive } = body;

    const data = db.read();
    const productIndex = data.products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Update Product Details
    data.products[productIndex] = {
      ...data.products[productIndex],
      name: name || data.products[productIndex].name,
      description: description !== undefined ? description : data.products[productIndex].description,
      eggType: eggType || data.products[productIndex].eggType,
      packSize: packSize !== undefined ? parseInt(packSize) : data.products[productIndex].packSize,
      price: price !== undefined ? parseFloat(price) : data.products[productIndex].price,
      imageUrl: imageUrl || data.products[productIndex].imageUrl,
      isActive: isActive !== undefined ? !!isActive : data.products[productIndex].isActive,
      updatedAt: new Date().toISOString()
    };

    // Update inventory quantity and threshold
    const invIndex = data.inventory.findIndex(i => i.productId === productId);
    if (invIndex > -1) {
      if (stock !== undefined) data.inventory[invIndex].quantity = parseInt(stock);
      if (lowStockThreshold !== undefined) data.inventory[invIndex].lowStockThreshold = parseInt(lowStockThreshold);
      data.inventory[invIndex].updatedAt = new Date().toISOString();
    }

    db.write(data);

    const inv = data.inventory[invIndex];
    return NextResponse.json({
      success: true,
      data: {
        ...data.products[productIndex],
        stock: inv ? inv.quantity : 0,
        lowStockThreshold: inv ? inv.lowStockThreshold : 10
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const data = db.read();
    const productIndex = data.products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Toggle isActive to false (soft delete)
    data.products[productIndex].isActive = false;
    data.products[productIndex].updatedAt = new Date().toISOString();

    db.write(data);
    return NextResponse.json({ success: true, message: 'Product archived successfully' });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
