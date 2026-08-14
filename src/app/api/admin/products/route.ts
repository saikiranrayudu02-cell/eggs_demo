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
    
    // Join products with inventory
    const productsWithStock = data.products.map(p => {
      const inv = data.inventory.find(i => i.productId === p.id);
      return {
        ...p,
        stock: inv ? inv.quantity : 0,
        lowStockThreshold: inv ? inv.lowStockThreshold : 10
      };
    });

    return NextResponse.json({ success: true, data: productsWithStock });
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
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, eggType, packSize, price, stock, lowStockThreshold, imageUrl } = body;

    if (!name || !eggType || !packSize || !price) {
      return NextResponse.json({ success: false, message: 'Missing product details' }, { status: 400 });
    }

    const data = db.read();

    // Create unique slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let count = 1;
    while (data.products.some(p => p.slug === slug)) {
      slug = `${baseSlug}-${count++}`;
    }

    const newProductId = data.products.length > 0 ? Math.max(...data.products.map(p => p.id)) + 1 : 1;
    
    const newProduct = {
      id: newProductId,
      name,
      slug,
      description: description || '',
      eggType: eggType as any,
      packSize: parseInt(packSize),
      price: parseFloat(price),
      imageUrl: imageUrl || '/images/default-egg.jpg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newInventory = {
      id: data.inventory.length > 0 ? Math.max(...data.inventory.map(i => i.id)) + 1 : 1,
      productId: newProductId,
      quantity: stock !== undefined ? parseInt(stock) : 0,
      lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : 10,
      updatedAt: new Date().toISOString()
    };

    data.products.push(newProduct);
    data.inventory.push(newInventory);
    db.write(data);

    return NextResponse.json({
      success: true,
      data: {
        ...newProduct,
        stock: newInventory.quantity,
        lowStockThreshold: newInventory.lowStockThreshold
      }
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
