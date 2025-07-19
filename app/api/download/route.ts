import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { downloadVideo } from '@/lib/downloader';
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

  const db = await getDb();
  const user = db.data.users.find((u: User) => u.id === decoded.userId);

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const { url, format, platform } = await req.json();

  if (!url) {
    return NextResponse.json({ message: 'Video URL is required' }, { status: 400 });
  }

  const downloadPath = user.downloadPath || './downloads';
  let platformCookies;
  if (platform === 'youtube') {
    platformCookies = user.youtubeCookies;
  } else if (platform === 'instagram') {
    platformCookies = user.instagramCookies;
  } else if (platform === 'x') {
    platformCookies = user.xCookies;
  }

  const result = await downloadVideo({
    url,
    downloadPath,
    cookies: platformCookies ?? undefined,
    format,
  });

  if (result.success) {
    return NextResponse.json({ message: result.message });
  } else {
    return NextResponse.json({ message: result.message }, { status: 500 });
  }
}
