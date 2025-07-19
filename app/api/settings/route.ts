import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { getDb } from '../../lib/db';
import { User } from '../../lib/types';

interface JwtPayload {
  userId: string;
}

export async function POST(req: NextRequest) {
  const token = cookies().get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token) as JwtPayload | null;

  if (!decoded) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const body = await req.json();
  const db = await getDb();

  const userIndex = db.data.users.findIndex((u: User) => u.id === decoded.userId);

  if (userIndex === -1) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const updatedUser = {
    ...db.data.users[userIndex],
    downloadPath: body.downloadPath,
    youtubeCookies: body.youtubeCookies,
    instagramCookies: body.instagramCookies,
    xCookies: body.xCookies,
    updatedAt: new Date().toISOString(),
  };

  db.data.users[userIndex] = updatedUser;
  await db.write();

  return NextResponse.json({ message: 'Settings updated successfully' });
}
