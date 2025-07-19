import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt';
import { getDb } from '../../lib/db';
import { User } from '../../lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const db = await getDb();
    const existingUser = db.data.users.find((user: User) => user.email === email);

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const newUser: User = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      role: 'USER', // Default role
      createdAt: now,
      updatedAt: now,
    };

    db.data.users.push(newUser);
    await db.write();

    return NextResponse.json({ message: 'User created successfully', userId: newUser.id }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
