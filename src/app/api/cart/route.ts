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
    if (!payload) return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });

    const data = db.read();
    let cart = data.carts.find(c => c.userId === payload.userId);

    if (!cart) {
      cart = {
        id: data.carts.length > 0 ? Math.max(...data.carts.map(c => c.id)) + 1 : 1,
        userId: payload.userId,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.carts.push(cart);
      db.write(data);
    }

    // Populate item details
    const populatedItems = cart.items.map(item => {
      const product = data.products.find(p => p.id === item.productId);
      const inv = data.inventory.find(i => i.productId === item.productId);
      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        name: product ? product.name : 'Unknown Product',
        price: product ? product.price : 0,
        imageUrl: product ? product.imageUrl : '',
        packSize: product ? product.packSize : 0,
        eggType: product ? product.eggType : 'OTHER',
        stock: inv ? inv.quantity : 0,
      };
    });

    const subtotal = populatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Delivery Fee rule: ₹30, free delivery for orders above ₹300
    const deliveryFee = subtotal > 0 && subtotal < 300 ? 30 : 0;
    const discount = 0; // Configurable discount for future
    const total = subtotal + deliveryFee - discount;

    return NextResponse.json({
      success: true,
      data: {
        id: cart.id,
        items: populatedItems,
        summary: {
          subtotal,
          deliveryFee,
          discount,
          total
        }
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });

    const { productId, quantity } = await request.json();
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid product ID or quantity' }, { status: 400 });
    }

    const data = db.read();
    
    // Check product and stock
    const product = data.products.find(p => p.id === productId && p.isActive);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found or inactive' }, { status: 404 });
    }

    const inv = data.inventory.find(i => i.productId === productId);
    const availableStock = inv ? inv.quantity : 0;
    if (availableStock < quantity) {
      return NextResponse.json({ success: false, message: `Only ${availableStock} packs left in stock` }, { status: 400 });
    }

    let cartIndex = data.carts.findIndex(c => c.userId === payload.userId);
    if (cartIndex === -1) {
      const newCart = {
        id: data.carts.length > 0 ? Math.max(...data.carts.map(c => c.id)) + 1 : 1,
        userId: payload.userId,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.carts.push(newCart);
      cartIndex = data.carts.length - 1;
    }

    const cart = data.carts[cartIndex];
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
      const newQty = cart.items[existingItemIndex].quantity + quantity;
      if (availableStock < newQty) {
        return NextResponse.json({ success: false, message: `Cannot add more. Total in cart exceeds available stock (${availableStock} packs)` }, { status: 400 });
      }
      cart.items[existingItemIndex].quantity = newQty;
      cart.items[existingItemIndex].updatedAt = new Date().toISOString();
    } else {
      const newItemId = cart.items.length > 0 ? Math.max(...cart.items.map(item => item.id)) + 1 : 1;
      cart.items.push({
        id: newItemId,
        cartId: cart.id,
        productId,
        quantity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    cart.updatedAt = new Date().toISOString();
    db.write(data);

    return NextResponse.json({ success: true, message: 'Item added to cart successfully' });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
