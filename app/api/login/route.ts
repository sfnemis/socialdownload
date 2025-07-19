import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';
import { getDb } from '../../lib/db';
import { User } from '../../lib/types';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  const db = await getDb();
  const user = db.data.users.find((u: User) => u.email === email);

  if (!user) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  // Ensure we are working with a plain object, not a proxy from the DB
  const plainUser = { ...user };

  const isPasswordValid = await bcrypt.compare(password, plainUser.password);

  if (!isPasswordValid) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const token = generateToken({ userId: user.id, role: user.role });

  const response = NextResponse.json({ message: 'Login successful' });
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}
