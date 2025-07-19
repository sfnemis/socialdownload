"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { DownloaderForm } from '@/components/DownloaderForm';
import { SettingsForm } from '@/components/SettingsForm';
import { FileBrowser } from '@/components/FileBrowser';

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch('/api/logout', { method: 'POST' });
    if (res.ok) {
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Button onClick={handleLogout}>Logout</Button>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="downloader">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="downloader">Downloader</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="downloader">
              <DownloaderForm />
            </TabsContent>
            <TabsContent value="files">
              <FileBrowser />
            </TabsContent>
            <TabsContent value="settings">
              <SettingsForm />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

