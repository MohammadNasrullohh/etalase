import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock next/headers cookies
const cookieGet = vi.hoisted(() => vi.fn(() => ({ value: 'lawet-auth-token-123' })))
vi.mock('next/headers', () => ({
  cookies: () => ({ get: cookieGet }),
}))

describe('Centralized Lawet Hub Approval Workflow (ADR-0005)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('LAWET_API_URL', 'http://127.0.0.1:2002')
    cookieGet.mockReturnValue({ value: 'lawet-auth-token-123' } as any)
  })

  it('1. getApprovalQueueAction memanggil GET /api/v1/jurnal-alas/approval-queue di Lawet Hub', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'lawet-jurnal-1',
          judul: 'Jurnal Bawahan Lawet Hub',
          status: 'draft',
          kategori: 'sosialisasi',
          created_by: 'Adhi',
          divisi: 'Humas',
          tanggal_kegiatan: '2026-08-01',
        },
      ],
    })
    vi.stubGlobal('fetch', fetchSpy)

    const { getApprovalQueueAction } = await import('@/entities/jurnal/api/approve-jurnal.action')
    const result = await getApprovalQueueAction()

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
    expect(result.data[0].judul).toBe('Jurnal Bawahan Lawet Hub')
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://127.0.0.1:2002/api/v1/jurnal-alas/approval-queue',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer lawet-auth-token-123',
        }),
      })
    )
  })

  it('2. getApprovalJurnalAction memanggil GET /api/v1/jurnal-alas/approval-queue/:id di Lawet Hub', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'lawet-jurnal-1',
        judul: 'Detail Jurnal Bawahan',
        status: 'draft',
        kategori: 'sosialisasi',
      }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const { getApprovalJurnalAction } = await import('@/entities/jurnal/api/approve-jurnal.action')
    const result = await getApprovalJurnalAction('lawet-jurnal-1')

    expect(result.success).toBe(true)
    expect(result.data.judul).toBe('Detail Jurnal Bawahan')
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://127.0.0.1:2002/api/v1/jurnal-alas/approval-queue/lawet-jurnal-1',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer lawet-auth-token-123',
        }),
      })
    )
  })

  it('3. approveJurnalAction memanggil POST /api/v1/jurnal-alas/:id/approve di Lawet Hub', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', alas: { queued: true } }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const { approveJurnalAction } = await import('@/entities/jurnal/api/approve-jurnal.action')
    const result = await approveJurnalAction('lawet-jurnal-1')

    expect(result.success).toBe(true)
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://127.0.0.1:2002/api/v1/jurnal-alas/lawet-jurnal-1/approve',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer lawet-auth-token-123',
        }),
      })
    )
  })

  it('4. requestRevisionAction memanggil POST /api/v1/jurnal-alas/:id/reject di Lawet Hub', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'lawet-jurnal-1', status: 'rejected' }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const { requestRevisionAction } = await import('@/entities/jurnal/api/approve-jurnal.action')
    const result = await requestRevisionAction('lawet-jurnal-1', 'Mohon lengkapi dokumentasi')

    expect(result.success).toBe(true)
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://127.0.0.1:2002/api/v1/jurnal-alas/lawet-jurnal-1/reject',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer lawet-auth-token-123',
        }),
      })
    )
  })
})
