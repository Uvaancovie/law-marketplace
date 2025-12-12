import pg from 'pg';
import path from 'path';
import fs from 'fs';

const { Pool } = pg;

// NOTE: In a production environment, use process.env.POSTGRES_URL
const connectionString = process.env.POSTGRES_URL || process.env.POSTGRESQL_URL || '';

let pool;

async function createPool() {
  if (connectionString) {
    try {
      pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false
        }
      });
      // Test connection
      await pool.query('SELECT 1');
      return pool;
    } catch (e) {
      console.warn('Failed to connect to Postgres. Falling back to in-memory mock:', e.message);
    }
  }

  // Fallback to a mock pool if no DB available
  const mockPath = path.join(process.cwd(), 'api', 'mockPool.js');
  if (fs.existsSync(mockPath)) {
    const createMockPool = (await import('./mockPool.js')).default;
    pool = createMockPool();
    return pool;
  }

  throw new Error('No database configured and no mock pool found');
}

const started = createPool();
export default { query: async (...args) => { await started; return pool.query(...args); } };