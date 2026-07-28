import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '../../../../drizzle/schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL wajib diisi pada lingkungan produksi.')
}

const isLocalDatabase = connectionString
  ? /(?:localhost|127\.0\.0\.1|alas-db)/.test(connectionString)
  : true

const pool = new Pool({
  // Fallback hanya untuk test/development lokal; produksi tidak boleh memakai kredensial bawaan.
  connectionString: connectionString || 'postgresql://alas_user:change-this-strong-password@localhost:5432/alas',
  max: 10,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  ssl: !isLocalDatabase
    ? { rejectUnauthorized: true }
    : undefined,
})

export const db = drizzle(pool, { schema })
export type DB = typeof db
