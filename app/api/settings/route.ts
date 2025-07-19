import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

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

  await prisma.user.update({
    where: { id: decoded.userId },
    data: {
      downloadPath: body.downloadPath,
      youtubeCookies: body.youtubeCookies,
      instagramCookies: body.instagramCookies,
      xCookies: body.xCookies,
    },
  });

  return NextResponse.json({ message: 'Settings updated successfully' });
}
