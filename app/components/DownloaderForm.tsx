"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export function DownloaderForm() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('video');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const platform = getPlatform(url);

    const res = await fetch('/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, format, platform }),
    });

    const data = await res.json();
    setMessage(data.message);
    setIsLoading(false);
  };

  const getPlatform = (url: string): string => {
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Downloader</CardTitle>
        <CardDescription>Paste a link to download a video. The files will be saved in your specified download folder.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <div className="flex items-center space-x-4">
            <label>
              <input
                type="radio"
                value="video"
                checked={format === 'video'}
                onChange={(e) => setFormat(e.target.value)}
                className="mr-2"
              />
              Video (720p + Audio)
            </label>
            <label>
              <input
                type="radio"
                value="audio"
                checked={format === 'audio'}
                onChange={(e) => setFormat(e.target.value)}
                className="mr-2"
              />
              Audio only (MP3)
            </label>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Downloading...' : 'Download'}
          </Button>
          {message && <p className="text-sm text-gray-600 mt-4">{message}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
