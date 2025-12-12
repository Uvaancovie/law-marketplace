import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_URL_LOCAL || process.env.POSTGRESQL_URL;

if (!connectionString) {
  console.error('No POSTGRES_URL found in environment. Please set POSTGRES_URL in .env');
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function seed() {
  try {
    const seedFile = fs.existsSync(path.join(process.cwd(), 'db_setup.sql')) ? 'db_setup.sql' : 'db_setup.sql.new';
    const sql = fs.readFileSync(path.join(process.cwd(), seedFile), 'utf8');
    const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (err) {
        // Log and continue - create statements may not be allowed depending on host
        console.warn('Statement failed (continuing):', stmt.slice(0, 100), err.message);
      }
    }
    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed DB:', err);
    process.exit(1);
  }
}

seed();
