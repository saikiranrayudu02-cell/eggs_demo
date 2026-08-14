import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    const data = db.read();
    
    // Check if email or phone already exists
    const emailExists = data.users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 400 });
    }

    const phoneExists = data.users.some(u => u.phone === phone);
    if (phoneExists) {
      return NextResponse.json({ success: false, message: 'Phone number already registered' }, { status: 400 });
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = {
      id: data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1,
      name,
      email,
      phone,
      passwordHash,
      role: 'CUSTOMER' as const,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.users.push(newUser);
    db.write(data);

    // Create session cookie
    const token = signToken({ userId: newUser.id, email: newUser.email, role: newUser.role });
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({ success: true, data: userWithoutPassword });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
