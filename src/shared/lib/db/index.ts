import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '../../../../drizzle/schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://alas_user:change-this-strong-password@localhost:5432/alas",
  max: 10,
})

export const db = drizzle(pool, { schema })
export type DB = typeof db
