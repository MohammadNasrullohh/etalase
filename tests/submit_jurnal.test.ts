import { beforeEach, describe, expect, it, vi } from 'vitest'
import { JurnalSubmissionPayload } from '@/entities/jurnal/model/submission-schema'

const cookieGet = vi.hoisted(() => vi.fn(() => ({ value: 'test-token' })))

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: cookieGet,
  }),
}))

describe('submitJurnalAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('LAWET_API_URL', 'http://lawet.internal')
  })

  it('posts payload to the correct Lawet Hub endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: 'jurnal-123',
      judul: 'Test Jurnal',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)

    const { submitJurnalAction } = await import('@/entities/jurnal/api/submit-jurnal.action')
    
    const payload: JurnalSubmissionPayload = {
      judul: 'Test Jurnal',
      tanggal_kegiatan: '2026-08-06',
      kategori: 'sosialisasi',
      dokumentasi: [],
      dokumen_pendukung: [],
      pihak_terkait: [],
      custom_fields: [],
      tags: ['bawaslu'],
      link_publikasi: ''
    }

    const result = await submitJurnalAction(payload)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://lawet.internal/api/v1/jurnal-alas/',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(payload)
      }),
    )

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data.id).toBe('jurnal-123')
  })

  it('returns unauthorized if token is missing', async () => {
    cookieGet.mockReturnValueOnce(undefined as any)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { submitJurnalAction } = await import('@/entities/jurnal/api/submit-jurnal.action')
    
    const result = await submitJurnalAction({
      judul: 'Test Jurnal',
      tanggal_kegiatan: '2026-08-06',
      kategori: 'sosialisasi',
      dokumentasi: [],
      dokumen_pendukung: [],
      pihak_terkait: [],
      custom_fields: [],
      tags: [],
    })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/unauthorized/i)
  })
})
