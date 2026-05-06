// -- PostgreSQL Connection Pool (raw pg) -------------------
import pg from 'pg';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const dbLog = logger.child('db');

/** Trim multi-line SQL down to one short line for the log row.
 *  Keeps the first ~120 chars so SELECTs don't fill the screen. */
function fmtSql(sql: string): string {
  const oneLine = sql.replace(/\s+/g, ' ').trim();
  return oneLine.length > 140 ? oneLine.slice(0, 137) + '...' : oneLine;
}

/** Trim values list — passwords / huge blobs shouldn't print. */
function fmtParams(params?: unknown[]): string {
  if (!params || params.length === 0) return '';
  const safe = params.map((p) => {
    if (p === null || p === undefined) return String(p);
    if (typeof p === 'string') return p.length > 60 ? `'${p.slice(0, 57)}...'` : `'${p}'`;
    if (Buffer.isBuffer(p)) return `<Buffer ${p.length}b>`;
    if (typeof p === 'object') return '<obj>';
    return String(p);
  });
  return ` [${safe.join(', ')}]`;
}

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
  dbLog.error('idle client error — pool will replace it:', err.message);
});

/** Returns true for the handful of error shapes that mean "the pooled
 *  connection was already dead when we picked it up" — i.e. retrying
 *  with a fresh client is safe and likely to succeed.
 *
 *  Deliberately does NOT match `connection timeout` / `ETIMEDOUT`: those
 *  mean we couldn't reach the DB at all (e.g. Render Free dyno cold
 *  start, network blip), and retrying immediately just doubles the load
 *  on the pooler without helping. */
function isStaleConnectionError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { message?: string; code?: string };
  const msg = (e.message || '').toLowerCase();
  // Specifically catch "Connection terminated unexpectedly" and
  // "terminating connection due to administrator command" — both mean
  // the existing socket died, not that we can't dial out.
  if (msg.includes('connection timeout') || msg.includes('etimedout')) return false;
  return (
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
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const ms = Date.now() - start;
    // Slow-query warning at 500ms — anything longer is worth flagging.
    if (ms > 500) {
      dbLog.warn(`SLOW ${ms}ms ${fmtSql(text)}${fmtParams(params)} (rows=${result.rowCount ?? 0})`);
    } else {
      dbLog.debug(`${ms}ms ${fmtSql(text)}${fmtParams(params)} (rows=${result.rowCount ?? 0})`);
    }
    return result;
  } catch (err) {
    if (isStaleConnectionError(err)) {
      dbLog.warn('stale connection, retrying once:', (err as Error).message);
      const result = await pool.query<T>(text, params);
      dbLog.debug(`retry ok ${fmtSql(text)} (rows=${result.rowCount ?? 0})`);
      return result;
    }
    dbLog.error(`FAIL ${Date.now() - start}ms ${fmtSql(text)}${fmtParams(params)} :: ${(err as Error).message}`);
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
