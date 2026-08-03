import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'

describe('signed Direct Service delivery integration', () => {
  let container: StartedPostgreSqlContainer
  let pool: Pool
  let servicePool: Pool | undefined

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start()
    process.env.DATABASE_URL = container.getConnectionUri()
    process.env.ALAS_SERVICE_TOKEN = 'integration-service-token'
    process.env.ALAS_WEBHOOK_SECRET = 'integration-signing-secret'
    process.env.ALAS_REPLAY_WINDOW_SECONDS = '300'

    pool = new Pool({ connectionString: process.env.DATABASE_URL })
    await migrate(drizzle(pool), { migrationsFolder: './drizzle/migrations' })
    vi.resetModules()
  }, 120_000)

  afterAll(async () => {
    await servicePool?.end()
    await pool?.end()
    await container?.stop()
  })

  it('processes a replayed signed event only once', async () => {
    const [{ NextRequest }, auth, route] = await Promise.all([
      import('next/server'),
      import('@/features/service-auth/lib/verify-token'),
      import('../src/app/api/service/jurnal/route'),
    ])
    servicePool = (await import('@/shared/lib/db')).db.$client
    const eventId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
    const body = JSON.stringify({
      source_id: '11111111-2222-4333-8444-555555555555',
      judul: 'Test signed delivery',
      tanggal_kegiatan: '2026-08-03',
      kategori: 'pengawasan',
    })
    const timestamp = String(Math.floor(Date.now() / 1000))
    const signature = auth.createServiceSignature({
      timestamp,
      method: 'POST',
      pathname: '/api/service/jurnal',
      body,
    })
    const headers = {
      Authorization: 'Bearer integration-service-token',
      'Content-Type': 'application/json',
      'X-ALAS-Event-Id': eventId,
      'X-ALAS-Timestamp': timestamp,
      'X-ALAS-Signature': signature,
    }

    const first = await route.POST(new NextRequest('http://alas.test/api/service/jurnal', {
      method: 'POST', headers, body,
    }))
    const replay = await route.POST(new NextRequest('http://alas.test/api/service/jurnal', {
      method: 'POST', headers, body,
    }))

    expect(first.status).toBe(201)
    expect(replay.status).toBe(200)
    expect(await replay.json()).toMatchObject({ status: 'ok', action: 'duplicate' })
    const eventCount = await pool.query('SELECT count(*)::int AS count FROM service_events')
    const jurnalCount = await pool.query('SELECT count(*)::int AS count FROM jurnal')
    expect(eventCount.rows[0].count).toBe(1)
    expect(jurnalCount.rows[0].count).toBe(1)
  })
})
