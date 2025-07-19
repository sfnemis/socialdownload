import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
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
