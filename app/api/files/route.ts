import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const downloadPath = './downloads';
  const filesByPlatform: { [key: string]: string[] } = {};

  try {
    const entries = await fs.readdir(downloadPath, { withFileTypes: true });
    const files = entries
      .filter(entry => !entry.isDirectory())
      .map(entry => entry.name);
    filesByPlatform['all'] = files;
  } catch (error) {
    filesByPlatform['all'] = [];
  }

  return NextResponse.json(filesByPlatform);
}
