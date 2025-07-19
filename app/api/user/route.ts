import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { getDb } from '../../lib/db';
import { User } from '../../lib/types';

interface JwtPayload {
  userId: string;
}

export async function GET(req: NextRequest) {
  const token = cookies().get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token) as JwtPayload | null;

  if (!decoded) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const db = await getDb();
  const user = db.data.users.find((u: User) => u.id === decoded.userId);

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  // Omit password before sending response
  const { password, ...userWithoutPassword } = user;

  return NextResponse.json(userWithoutPassword);
}
