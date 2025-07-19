import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';

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
  });

  if (!user || !user.downloadPath) {
    return NextResponse.json({ youtube: [], instagram: [], x: [], other: [] });
  }

  const { downloadPath } = user;
  const platforms = ['youtube', 'instagram', 'x', 'other'];
  const filesByPlatform: { [key: string]: string[] } = {};

  for (const platform of platforms) {
    const platformPath = path.join(downloadPath, platform);
    try {
      await fs.access(platformPath);
      const files = await fs.readdir(platformPath);
      filesByPlatform[platform] = files;
    } catch (error) {
      filesByPlatform[platform] = [];
    }
  }

  return NextResponse.json(filesByPlatform);
}
