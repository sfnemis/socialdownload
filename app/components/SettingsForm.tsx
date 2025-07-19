"use client";

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

interface UserSettings {
  downloadPath: string;
  youtubeCookies: string;
  instagramCookies: string;
  xCookies: string;
}

export function SettingsForm() {
  const [settings, setSettings] = useState<Partial<UserSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    const data = await res.json();
    setMessage(data.message);
    setIsSaving(false);
  };

  if (isLoading) {
    return <p>Loading settings...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your application settings and preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="downloadPath" className="block text-sm font-medium text-gray-700">Download Path</label>
            <Input
              id="downloadPath"
              name="downloadPath"
              value={settings.downloadPath || ''}
              onChange={handleChange}
              placeholder="/path/to/your/downloads"
            />
          </div>
          <div>
            <label htmlFor="youtubeCookies" className="block text-sm font-medium text-gray-700">YouTube Cookies</label>
            <textarea
              id="youtubeCookies"
              name="youtubeCookies"
              value={settings.youtubeCookies || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Paste your YouTube cookies here for private videos"
            />
          </div>
          <div>
            <label htmlFor="instagramCookies" className="block text-sm font-medium text-gray-700">Instagram Cookies</label>
            <textarea
              id="instagramCookies"
              name="instagramCookies"
              value={settings.instagramCookies || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Paste your Instagram cookies here for private videos"
            />
          </div>
          <div>
            <label htmlFor="xCookies" className="block text-sm font-medium text-gray-700">X (Twitter) Cookies</label>
            <textarea
              id="xCookies"
              name="xCookies"
              value={settings.xCookies || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Paste your X cookies here for private videos"
            />
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
          {message && <p className="text-sm text-gray-600 mt-4">{message}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
