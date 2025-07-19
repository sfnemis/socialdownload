import { NextRequest, NextResponse } from 'next/server';
import { downloadVideo } from '@/lib/downloader';

export async function POST(req: NextRequest) {
  const { url, format } = await req.json();

  if (!url) {
    return NextResponse.json({ message: 'Video URL is required' }, { status: 400 });
  }

  const downloadPath = './downloads'; // All downloads go to a shared directory

  const result = await downloadVideo({
    url,
    downloadPath,
    format,
  });

  if (result.success) {
    return NextResponse.json({ message: result.message });
  } else {
    return NextResponse.json({ message: result.message }, { status: 500 });
  }
}
