import { beforeEach, describe, expect, it, vi } from 'vitest'
import { JurnalSubmissionPayload } from '@/entities/jurnal/model/submission-schema'
import { db } from '@/shared/lib/db'

// Mock cookies
const cookieGet = vi.hoisted(() => vi.fn(() => ({ value: 'test-token' })))
vi.mock('next/headers', () => ({
  cookies: () => ({ get: cookieGet }),
}))

// Mock DB
vi.mock('@/shared/lib/db', () => {
  const insertMock = vi.fn(() => ({
    values: vi.fn().mockResolvedValue([{ source_id: 'mocked-uuid' }])
  }))
  const updateMock = vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{ id: 1, source_id: 'mocked-uuid', workflow_status: 'approved' }])
      }))
    }))
  }))
  const selectMock = vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn().mockResolvedValue([{ id: 1, source_id: 'mocked-uuid', workflow_status: 'submitted' }])
    }))
  }))
  
  return {
    db: {
      insert: insertMock,
      update: updateMock,
      select: selectMock
    }
  }
})

// Mock crypto
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-1234'
})

describe('ALAS Local Write Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookieGet.mockReturnValue({ value: 'test-token' } as any)
  })

  it('Skenario 1: Submit Jurnal validates input and writes to ALAS DB (Outbox)', async () => {
    const { submitJurnalAction } = await import('@/entities/jurnal/api/submit-jurnal.action')
    
    // Invalid Payload (Judul too short)
    const invalidPayload: JurnalSubmissionPayload = {
      judul: 'A',
      tanggal_kegiatan: '2026-08-06',
      kategori: 'sosialisasi',
      dokumentasi: [],
      dokumen_pendukung: [],
      pihak_terkait: [],
      custom_fields: [],
      tags: [],
    }
    const invalidRes = await submitJurnalAction(invalidPayload)
    expect(invalidRes.success).toBe(false)
    expect(invalidRes.error).toMatch(/minimal 3 karakter/i)

    // Valid Payload
    const validPayload: JurnalSubmissionPayload = {
      ...invalidPayload,
      judul: 'Rapat Bawaslu Valid'
    }
    
    const result = await submitJurnalAction(validPayload)
    expect(result.success).toBe(true)
    
    // Ensures DB insert is called twice (jurnal & outbox)
    expect(db.insert).toHaveBeenCalledTimes(2)
  })

  it('Skenario 2 & 5: Approval Queue and Approve Action (Lawet Hub Centralized)', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: '1', judul: 'Rapat Koordinasi Bawaslu' }],
    })
    vi.stubGlobal('fetch', fetchSpy)
    vi.stubEnv('LAWET_API_URL', 'http://127.0.0.1:2002')

    const { approveJurnalAction, getApprovalQueueAction } = await import('@/entities/jurnal/api/approve-jurnal.action')
    
    // Fetch Queue dari Lawet Hub
    const queueRes = await getApprovalQueueAction()
    expect(queueRes.success).toBe(true)
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://127.0.0.1:2002/api/v1/jurnal-alas/approval-queue',
      expect.any(Object)
    )

    // Approve Action ke Lawet Hub
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok' }),
    })
    const approveRes = await approveJurnalAction('1')
    expect(approveRes.success).toBe(true)
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://127.0.0.1:2002/api/v1/jurnal-alas/1/approve',
      expect.any(Object)
    )
  })
})
