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
    if (!payload) return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });

    const { quantity } = await request.json();
    if (!quantity || quantity <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid quantity' }, { status: 400 });
    }

    const data = db.read();
    const cartIndex = data.carts.findIndex(c => c.userId === payload.userId);
    if (cartIndex === -1) {
      return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 });
    }

    const cart = data.carts[cartIndex];
    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      return NextResponse.json({ success: false, message: 'Item not found in cart' }, { status: 404 });
    }

    // Verify stock
    const inv = data.inventory.find(i => i.productId === productId);
    const availableStock = inv ? inv.quantity : 0;
    if (availableStock < quantity) {
      return NextResponse.json({ success: false, message: `Only ${availableStock} packs left in stock` }, { status: 400 });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].updatedAt = new Date().toISOString();
    cart.updatedAt = new Date().toISOString();

    db.write(data);
    return NextResponse.json({ success: true, message: 'Cart updated successfully' });
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
    if (!payload) return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });

    const data = db.read();
    const cartIndex = data.carts.findIndex(c => c.userId === payload.userId);
    if (cartIndex === -1) {
      return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 });
    }

    const cart = data.carts[cartIndex];
    const itemExists = cart.items.some(item => item.productId === productId);
    if (!itemExists) {
      return NextResponse.json({ success: false, message: 'Item not in cart' }, { status: 404 });
    }

    cart.items = cart.items.filter(item => item.productId !== productId);
    cart.updatedAt = new Date().toISOString();

    db.write(data);
    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
