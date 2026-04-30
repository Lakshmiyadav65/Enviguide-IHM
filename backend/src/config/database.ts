// -- PostgreSQL Connection Pool (raw pg) -------------------
import pg from 'pg';
import { env } from './env.js';

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  // Recycle idle connections before Supabase / pgBouncer cuts them on its
  // side. PgBouncer's default `server_idle_timeout` is 600s; we'd rather
  // close ours first than be handed a half-dead socket.
  idleTimeoutMillis: 30_000,
  // Supabase free tier pauses the DB after ~7 days of inactivity, and the
  // first connection has to wait for it to wake up — that can take 30-60s.
  // 5s was way too aggressive: the connect would abort before the DB was
  // ready, the migrate would fail, the deploy would crash-loop.
  connectionTimeoutMillis: 60_000,
  // OS-level TCP keepalive — keeps NATs / load balancers from silently
  // dropping the connection while it's idle.
  keepAlive: true,
});

// Pool errors fire when an *idle* client dies (the most common cause of
// "Connection terminated unexpectedly"). pg removes that client from the
// pool automatically — we just need to log so we can spot patterns, not
// crash the process.
pool.on('error', (err) => {
  console.error('[pg] idle client error — pool will replace it:', err.message);
});

/** Returns true for the handful of error shapes that mean "the pooled
 *  connection was already dead when we picked it up" — i.e. retrying
 *  with a fresh client is safe and likely to succeed. */
function isStaleConnectionError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { message?: string; code?: string };
  const msg = (e.message || '').toLowerCase();
  return (
    msg.includes('connection terminated') ||
    msg.includes('connection terminated unexpectedly') ||
    msg.includes('terminating connection') ||
    e.code === 'ECONNRESET' ||
    e.code === '57P01' || // admin_shutdown
    e.code === '57P02'    // crash_shutdown
  );
}

/** Run a single query, retrying once if the first attempt hit a stale
 *  pooled connection. The retry uses a brand-new client from the pool. */
export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  try {
    return await pool.query<T>(text, params);
  } catch (err) {
    if (isStaleConnectionError(err)) {
      console.warn('[pg] stale connection, retrying once:', (err as Error).message);
      return await pool.query<T>(text, params);
    }
    throw err;
  }
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
