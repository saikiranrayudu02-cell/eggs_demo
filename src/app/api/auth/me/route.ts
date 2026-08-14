import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET() {
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

    const data = db.read();
    const user = data.users.find(u => u.id === payload.userId);

    if (!user || !user.isActive) {
      return NextResponse.json({ success: false, message: 'User not found or inactive' }, { status: 401 });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, data: userWithoutPassword });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
