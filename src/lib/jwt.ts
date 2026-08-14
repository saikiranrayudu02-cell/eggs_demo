import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'eggcart-demo-secret-key-1234567890';

export function signToken(payload: { userId: number; email: string; role: 'CUSTOMER' | 'ADMIN' }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: number; email: string; role: 'CUSTOMER' | 'ADMIN' } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}
