import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'
import { User } from './types';

// Define the data structure for our database
export interface AppData {
  users: User[];
}

// Configure the database
// We store the database file in the /data volume that is mounted in the Docker container.
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/data/db.json' 
  : path.join(process.cwd(), 'local-db.json');

const adapter = new JSONFile<AppData>(dbPath)
const defaultData: AppData = { users: [] }
const db = new Low<AppData>(adapter, defaultData)

// Function to ensure the database file is read before any operation
export const getDb = async () => {
  await db.read()
  // If the file doesn't exist, write the default data to it
  if (db.data === null) {
    db.data = defaultData;
    await db.write();
  }
  return db
}
