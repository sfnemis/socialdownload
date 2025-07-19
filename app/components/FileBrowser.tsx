"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

interface FilesByPlatform {
  youtube: string[];
  instagram: string[];
  x: string[];
  other: string[];
}

export function FileBrowser() {
  const [files, setFiles] = useState<Partial<FilesByPlatform>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      const res = await fetch('/api/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
      setIsLoading(false);
    };
    fetchFiles();
  }, []);

  if (isLoading) {
    return <p>Loading files...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Downloaded Files</CardTitle>
        <CardDescription>Browse your downloaded files, categorized by platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="youtube">
          <TabsList>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="x">X (Twitter)</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
          <TabsContent value="youtube">
            <FileList files={files.youtube} />
          </TabsContent>
          <TabsContent value="instagram">
            <FileList files={files.instagram} />
          </TabsContent>
          <TabsContent value="x">
            <FileList files={files.x} />
          </TabsContent>
          <TabsContent value="other">
            <FileList files={files.other} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function FileList({ files }: { files: string[] | undefined }) {
  if (!files || files.length === 0) {
    return <p className="text-sm text-gray-500 mt-4">No files found in this category.</p>;
  }

  return (
    <ul className="mt-4 space-y-2">
      {files.map((file, index) => (
        <li key={index} className="text-sm p-2 bg-gray-50 rounded-md">{file}</li>
      ))}
    </ul>
  );
}
