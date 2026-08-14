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
    const userAddresses = data.addresses.filter(addr => addr.userId === payload.userId);

    return NextResponse.json({ success: true, data: userAddresses });
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

    const body = await request.json();
    const { fullName, phone, house, street, area, city, state, pincode, isDefault } = body;

    if (!fullName || !phone || !house || !city || !state || !pincode) {
      return NextResponse.json({ success: false, message: 'Missing required address fields' }, { status: 400 });
    }

    const data = db.read();
    
    // If setting to default, clear defaults for other addresses of this user
    if (isDefault) {
      data.addresses = data.addresses.map(addr => 
        addr.userId === payload.userId ? { ...addr, isDefault: false } : addr
      );
    }

    // Determine if this is the first address, if so default it to true
    const userAddresses = data.addresses.filter(addr => addr.userId === payload.userId);
    const shouldBeDefault = userAddresses.length === 0 ? true : !!isDefault;

    const newAddress = {
      id: data.addresses.length > 0 ? Math.max(...data.addresses.map(a => a.id)) + 1 : 1,
      userId: payload.userId,
      fullName,
      phone,
      house,
      street: street || '',
      area: area || '',
      city,
      state,
      pincode,
      isDefault: shouldBeDefault,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.addresses.push(newAddress);
    db.write(data);

    return NextResponse.json({ success: true, data: newAddress });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
