import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const cookieSet = vi.hoisted(() => vi.fn())
const cookieGet = vi.hoisted(() => vi.fn(() => ({ value: 'read-token' })))

vi.mock('next/headers', () => ({
  cookies: () => ({
    set: cookieSet,
    get: cookieGet,
    delete: vi.fn(),
  }),
}))

describe('Lawet dashboard security boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('LAWET_API_URL', 'http://lawet.internal')
  })

  it('identifies ALAS when requesting a Lawet access token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      access_token: 'read-token',
      user: { id: 'user-1' },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)

    const { loginAction } = await import('@/features/lawet-auth/api/login.action')
    await loginAction('operator', '1234')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://lawet.internal/api/v1/auth/login',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-Lawet-Client': 'alas-dashboard' }),
      }),
    )
  })

  it('proxies protected media with bearer auth and private no-store caching', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('image', {
      status: 200,
      headers: { 'Content-Type': 'image/jpeg' },
    }))
    vi.stubGlobal('fetch', fetchMock)
    const { GET } = await import('../src/app/api/v1/jurnal-alas/media/[...path]/route')
    const request = new NextRequest('http://alas.local/api/v1/jurnal-alas/media/jurnal-foto/a.jpg', {
      headers: { cookie: 'lawet_token=read-token' },
    })

    const response = await GET(request, { params: { path: ['jurnal-foto', 'a.jpg'] } })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://lawet.internal/api/v1/jurnal-alas/media/jurnal-foto/a.jpg',
      expect.objectContaining({
        cache: 'no-store',
        headers: { Authorization: 'Bearer read-token' },
      }),
    )
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
  })

  it('rejects unauthenticated and out-of-prefix media paths before calling Lawet', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { GET } = await import('../src/app/api/v1/jurnal-alas/media/[...path]/route')

    const unauthenticated = await GET(
      new NextRequest('http://alas.local/api/v1/jurnal-alas/media/jurnal-foto/a.jpg'),
      { params: { path: ['jurnal-foto', 'a.jpg'] } },
    )
    const invalidPath = await GET(
      new NextRequest('http://alas.local/api/v1/jurnal-alas/media/private/a.jpg', {
        headers: { cookie: 'lawet_token=read-token' },
      }),
      { params: { path: ['private', 'a.jpg'] } },
    )

    expect(unauthenticated.status).toBe(401)
    expect(invalidPath.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

})
