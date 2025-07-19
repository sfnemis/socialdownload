// This file defines the shared data structures for the application.

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
  downloadPath?: string;
  youtubeCookies?: string;
  instagramCookies?: string;
  xCookies?: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}
