import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = db.read();
    
    // Find by ID or slug
    const product = data.products.find(p => p.id === parseInt(id) || p.slug === id);

    if (!product || !product.isActive) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const inv = data.inventory.find(i => i.productId === product.id);
    const reviews = data.reviews.filter(r => r.productId === product.id && r.isApproved);

    const productDetails = {
      ...product,
      stock: inv ? inv.quantity : 0,
      lowStockThreshold: inv ? inv.lowStockThreshold : 10,
      reviews
    };

    return NextResponse.json({ success: true, data: productDetails });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
