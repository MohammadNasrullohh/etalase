import { describe, it, expect, afterEach } from 'vitest'
import { verifyToken } from '@/features/service-auth/lib/verify-token'

describe('Service Token Auth', () => {
  const originalEnv = process.env.ALAS_SERVICE_TOKEN

  afterEach(() => {
    process.env.ALAS_SERVICE_TOKEN = originalEnv
  })

  it('should validate correctly matching token', () => {
    process.env.ALAS_SERVICE_TOKEN = 'secret-token'
    expect(verifyToken('secret-token')).toBe(true)
  })

  it('should reject incorrect token', () => {
    process.env.ALAS_SERVICE_TOKEN = 'secret-token'
    expect(verifyToken('wrong-token')).toBe(false)
  })

  it('should return false if service token is empty', () => {
    process.env.ALAS_SERVICE_TOKEN = ''
    expect(verifyToken('token')).toBe(false)
  })
})
