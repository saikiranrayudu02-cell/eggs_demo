import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });

    const { productId, rating, comment } = await request.json();
    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: 'Invalid product or rating (1-5)' }, { status: 400 });
    }

    const data = db.read();
    const product = data.products.find(p => p.id === productId);
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const newReviewId = data.reviews.length > 0 ? Math.max(...data.reviews.map(r => r.id)) + 1 : 1;
    const newReview = {
      id: newReviewId,
      userId: payload.userId,
      userName: payload.email.split('@')[0], // default handle
      productId,
      rating: parseInt(rating),
      comment: comment || '',
      isApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If customer name exists, resolve it
    const user = data.users.find(u => u.id === payload.userId);
    if (user) {
      newReview.userName = user.name;
    }

    data.reviews.push(newReview);
    db.write(data);

    return NextResponse.json({ success: true, data: newReview });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
