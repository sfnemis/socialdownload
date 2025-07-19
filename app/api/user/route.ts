import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

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

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      role: true,
      downloadPath: true,
      youtubeCookies: true,
      instagramCookies: true,
      xCookies: true,
    },
  });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}
