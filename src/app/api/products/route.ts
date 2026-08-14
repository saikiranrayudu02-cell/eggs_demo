import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || ''; // WHITE, BROWN, COUNTRY, etc.
    const sortBy = searchParams.get('sortBy') || 'newest'; // price-asc, price-desc, popularity, newest

    const data = db.read();
    let filteredProducts = data.products.filter(p => p.isActive);

    // Filter by type
    if (type) {
      filteredProducts = filteredProducts.filter(p => p.eggType.toLowerCase() === type.toLowerCase());
    }

    // Filter by search query
    if (search) {
      const q = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // Attach inventory stock info
    const productsWithStock = filteredProducts.map(p => {
      const inv = data.inventory.find(i => i.productId === p.id);
      return {
        ...p,
        stock: inv ? inv.quantity : 0,
        lowStockThreshold: inv ? inv.lowStockThreshold : 10
      };
    });

    // Sorting
    if (sortBy === 'price-asc') {
      productsWithStock.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      productsWithStock.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popularity') {
      // Calculate avg rating or sort by reviews length
      productsWithStock.sort((a, b) => {
        const ratingA = data.reviews.filter(r => r.productId === a.id).reduce((sum, r) => sum + r.rating, 0) / 
                       (data.reviews.filter(r => r.productId === a.id).length || 1);
        const ratingB = data.reviews.filter(r => r.productId === b.id).reduce((sum, r) => sum + r.rating, 0) / 
                       (data.reviews.filter(r => r.productId === b.id).length || 1);
        return ratingB - ratingA;
      });
    } else {
      // Newest first (ID desc)
      productsWithStock.sort((a, b) => b.id - a.id);
    }

    return NextResponse.json({ success: true, data: productsWithStock });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
