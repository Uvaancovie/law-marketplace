import pg from 'pg';

const { Pool } = pg;

// NOTE: In a production environment, use process.env.POSTGRES_URL
// For now, we use the provided connection string.
const connectionString = process.env.POSTGRES_URL || 'postgresql://law_marketplace_user:ifKyWA9MJaTVcGx3TfFdgI3xpY04x1Th@dpg-d4tuof95pdvs73edeg10-a.ohio-postgres.render.com/law_marketplace?ssl=true';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for some Render/cloud hosted Postgres connections
  }
});

export default pool;