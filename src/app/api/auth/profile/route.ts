import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
    }

    const { name, email, phone } = await request.json();
    if (!name || !email || !phone) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const data = db.read();
    const userIndex = data.users.findIndex(u => u.id === payload.userId);

    if (userIndex === -1) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Check unique constraints for email/phone if they changed
    const emailConflict = data.users.some(u => u.id !== payload.userId && u.email.toLowerCase() === email.toLowerCase());
    if (emailConflict) {
      return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 400 });
    }

    const phoneConflict = data.users.some(u => u.id !== payload.userId && u.phone === phone);
    if (phoneConflict) {
      return NextResponse.json({ success: false, message: 'Phone number already in use' }, { status: 400 });
    }

    // Update
    data.users[userIndex] = {
      ...data.users[userIndex],
      name,
      email,
      phone,
      updatedAt: new Date().toISOString()
    };

    db.write(data);

    const { passwordHash: _, ...updatedUser } = data.users[userIndex];
    return NextResponse.json({ success: true, data: updatedUser });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
