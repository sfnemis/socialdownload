import YTDlpWrap from 'yt-dlp-wrap';
import path from 'path';

const ytDlpWrap = new YTDlpWrap();

interface DownloadOptions {
  url: string;
  downloadPath: string;
  cookies?: string;
  format?: 'video' | 'audio';
}

export async function downloadVideo({ url, downloadPath, cookies, format = 'video' }: DownloadOptions) {
  const args = [
    '--progress',
    '--no-playlist',
  ];

  if (cookies) {
    args.push(`--cookies`, cookies);
  }

  if (format === 'audio') {
    args.push('-x', '--audio-format', 'mp3');
  } else {
    // Download 720p or best available video with audio
    args.push('-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]');
  }

  const platform = getPlatform(url);
  const platformPath = path.join(downloadPath, platform);

  args.push('-o', `${platformPath}/%(title)s.%(ext)s`);

  try {
    const result = await ytDlpWrap.execPromise(args.concat(url));
    console.log(result);
    return { success: true, message: 'Download started.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to start download.' };
  }
}

function getPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('instagram.com')) {
    return 'instagram';
  }
  if (url.includes('x.com') || url.includes('twitter.com')) {
    return 'x';
  }
  return 'other';
}
