import pg from 'pg'

let pool: pg.Pool | null = null

export function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.LIVE_COMMENTS_DATABASE_URL
    if (!connectionString) {
      throw new Error(
        'live-comments: LIVE_COMMENTS_DATABASE_URL environment variable is not set. ' +
        'Add it to your .env file or environment.'
      )
    }
    pool = new pg.Pool({
      connectionString,
      max: 5,
      ssl: connectionString.includes('neon.tech') || connectionString.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : undefined,
    })
  }
  return pool
}

export function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  return getPool().query<T>(text, params)
}
