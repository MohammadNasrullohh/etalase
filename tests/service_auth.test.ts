import { describe, it, expect, afterEach } from 'vitest'
import {
  createServiceSignature,
  verifyServiceSignature,
  verifyToken,
} from '@/features/service-auth/lib/verify-token'

describe('Service Token Auth', () => {
  const originalEnv = process.env.ALAS_SERVICE_TOKEN
  const originalSigningSecret = process.env.ALAS_WEBHOOK_SECRET
  const originalReplayWindow = process.env.ALAS_REPLAY_WINDOW_SECONDS

  afterEach(() => {
    process.env.ALAS_SERVICE_TOKEN = originalEnv
    process.env.ALAS_WEBHOOK_SECRET = originalSigningSecret
    process.env.ALAS_REPLAY_WINDOW_SECONDS = originalReplayWindow
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

  it('accepts a valid HMAC signature inside the replay window', () => {
    process.env.ALAS_WEBHOOK_SECRET = 'test-signing-secret'
    process.env.ALAS_REPLAY_WINDOW_SECONDS = '300'
    const timestamp = '1785733200'
    const signature = createServiceSignature({
      timestamp,
      method: 'POST',
      pathname: '/api/service/jurnal',
      body: '{"source_id":"11111111-2222-3333-4444-555555555555"}',
    })

    expect(verifyServiceSignature({
      timestamp,
      signature,
      method: 'POST',
      pathname: '/api/service/jurnal',
      body: '{"source_id":"11111111-2222-3333-4444-555555555555"}',
      nowSeconds: 1785733300,
    })).toBe(true)
  })

  it('rejects a correctly signed request outside the replay window', () => {
    process.env.ALAS_WEBHOOK_SECRET = 'test-signing-secret'
    process.env.ALAS_REPLAY_WINDOW_SECONDS = '60'
    const timestamp = '1785733200'
    const body = '{}'
    const signature = createServiceSignature({
      timestamp,
      method: 'PATCH',
      pathname: '/api/service/jurnal/11111111-2222-3333-4444-555555555555',
      body,
    })

    expect(verifyServiceSignature({
      timestamp,
      signature,
      method: 'PATCH',
      pathname: '/api/service/jurnal/11111111-2222-3333-4444-555555555555',
      body,
      nowSeconds: 1785733261,
    })).toBe(false)
  })
})
