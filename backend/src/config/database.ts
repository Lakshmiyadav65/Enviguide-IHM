// -- PostgreSQL Connection Pool (raw pg) -------------------
import pg from 'pg';
import { env } from './env.js';

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log connection errors
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

/** Run a single query */
export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}

/** Get a client for transactions */
export async function getClient(): Promise<pg.PoolClient> {
  return pool.connect();
}

/** Shutdown pool gracefully */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;
