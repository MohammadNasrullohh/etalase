import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('production compose security', () => {
  const compose = readFileSync('docker-compose.prod.yml', 'utf8')
  const databaseService = compose.slice(
    compose.indexOf('  alas-db:'),
    compose.indexOf('  alas-app:'),
  )

  it('requires an explicit database password', () => {
    expect(databaseService).toContain('POSTGRES_PASSWORD: ${ALAS_DB_PASSWORD:?')
    expect(databaseService).not.toMatch(/ALAS_DB_PASSWORD:-/)
  })

  it('does not publish PostgreSQL on the production host', () => {
    expect(databaseService).not.toMatch(/^\s+ports:/m)
    expect(databaseService).not.toContain('5433:5432')
  })
})
