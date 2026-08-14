import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const addressId = parseInt(id);
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });

    const body = await request.json();
    const { fullName, phone, house, street, area, city, state, pincode, isDefault } = body;

    const data = db.read();
    const addressIndex = data.addresses.findIndex(addr => addr.id === addressId && addr.userId === payload.userId);

    if (addressIndex === -1) {
      return NextResponse.json({ success: false, message: 'Address not found' }, { status: 404 });
    }

    if (isDefault) {
      // Clear other defaults
      data.addresses = data.addresses.map(addr => 
        addr.userId === payload.userId ? { ...addr, isDefault: false } : addr
      );
    }

    data.addresses[addressIndex] = {
      ...data.addresses[addressIndex],
      fullName: fullName || data.addresses[addressIndex].fullName,
      phone: phone || data.addresses[addressIndex].phone,
      house: house || data.addresses[addressIndex].house,
      street: street !== undefined ? street : data.addresses[addressIndex].street,
      area: area !== undefined ? area : data.addresses[addressIndex].area,
      city: city || data.addresses[addressIndex].city,
      state: state || data.addresses[addressIndex].state,
      pincode: pincode || data.addresses[addressIndex].pincode,
      isDefault: isDefault !== undefined ? !!isDefault : data.addresses[addressIndex].isDefault,
      updatedAt: new Date().toISOString()
    };

    db.write(data);

    return NextResponse.json({ success: true, data: data.addresses[addressIndex] });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const addressId = parseInt(id);
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });

    const data = db.read();
    const address = data.addresses.find(addr => addr.id === addressId && addr.userId === payload.userId);

    if (!address) {
      return NextResponse.json({ success: false, message: 'Address not found' }, { status: 404 });
    }

    // Filter it out
    data.addresses = data.addresses.filter(addr => !(addr.id === addressId && addr.userId === payload.userId));

    // If we deleted the default address, set another address as default if exists
    if (address.isDefault) {
      const remaining = data.addresses.filter(addr => addr.userId === payload.userId);
      if (remaining.length > 0) {
        remaining[0].isDefault = true;
      }
    }

    db.write(data);
    return NextResponse.json({ success: true, message: 'Address deleted successfully' });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
