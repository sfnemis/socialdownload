import bcrypt from 'bcryptjs';
import { createId } from '@paralleldrive/cuid2';
import { getDb } from '../app/lib/db';
import { User } from '../app/lib/types';

async function main() {
  const db = await getDb();
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin';

  // Check if admin user already exists
  const adminExists = db.data.users.find((user: User) => user.email === adminEmail);

  if (!adminExists) {
    console.log('Admin user not found, creating one...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const now = new Date().toISOString();

    const adminUser: User = {
      id: createId(),
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      createdAt: now,
      updatedAt: now,
    };

    db.data.users.push(adminUser);
    await db.write();
    console.log('Admin user created successfully.');
  } else {
    console.log('Admin user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
