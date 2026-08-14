import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const data = db.read();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || !user.isActive) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // Set cookie
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, data: userWithoutPassword });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
