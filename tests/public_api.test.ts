import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/shared/lib/db'
import { jurnal } from '../drizzle/schema'
import { eq } from 'drizzle-orm'
import { upsertJurnal } from '@/features/jurnal-sync/lib/upsert-jurnal'
import { getJurnalList } from '@/entities/jurnal/api/get-jurnal-list'
import { getJurnalDetail } from '@/entities/jurnal/api/get-jurnal-detail'
import { getJurnalCalendar } from '@/entities/jurnal/api/get-jurnal-calendar'

describe('Public API Queries Integration', () => {
  const source1 = 'aa111111-2222-3333-4444-555555555555'
  const source2 = 'bb111111-2222-3333-4444-555555555555'
  
  let id1 = ''
  let id2 = ''

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://alas_user:change-this-strong-password@localhost:5433/alas'
    
    await db.delete(jurnal).where(eq(jurnal.source_id, source1))
    await db.delete(jurnal).where(eq(jurnal.source_id, source2))

    const payload1 = {
      source_id: source1,
      judul: 'Published Jurnal Pilihan',
      tanggal_kegiatan: '2026-06-15',
      kategori: 'mou',
      dokumen_pendukung: [
        { nama: 'Publik Doc', url: 'https://media.com/public.pdf', tipe: 'pdf' },
        { nama: 'Privat Doc', url: 'https://media.com/private.pdf', tipe: 'pdf' },
      ]
    }
    const r1 = await upsertJurnal(payload1)
    id1 = r1.id

    const dbItem = await db.select().from(jurnal).where(eq(jurnal.id, id1)).limit(1)
    const docs = dbItem[0].dokumen_pendukung as any[]
    docs[1].is_public = false
    await db.update(jurnal).set({ dokumen_pendukung: docs }).where(eq(jurnal.id, id1))

    const payload2 = {
      source_id: source2,
      judul: 'Unpublished Jurnal Draft',
      tanggal_kegiatan: '2026-06-20',
      kategori: 'sengketa',
      dokumen_pendukung: []
    }
    const r2 = await upsertJurnal(payload2)
    id2 = r2.id
    await db.update(jurnal).set({ is_published: false }).where(eq(jurnal.id, id2))
  })

  afterAll(async () => {
    await db.delete(jurnal).where(eq(jurnal.source_id, source1))
    await db.delete(jurnal).where(eq(jurnal.source_id, source2))
  })

  it('should list only published items', async () => {
    const list = await getJurnalList({ limit: 10 })
    
    const hasSource1 = list.some(item => item.source_id === source1)
    const hasSource2 = list.some(item => item.source_id === source2)

    expect(hasSource1).toBe(true)
    expect(hasSource2).toBe(false)
  })

  it('should get detail and retain documents in raw query', async () => {
    const detail = await getJurnalDetail(id1, true)
    expect(detail).not.toBeNull()
    expect(detail?.judul).toBe('Published Jurnal Pilihan')

    const docs = detail?.dokumen_pendukung as any[]
    expect(docs.length).toBe(2)
    expect(docs.find(d => d.nama === 'Privat Doc').is_public).toBe(false)
  })

  it('should list active dates on calendar correctly', async () => {
    const calendar = await getJurnalCalendar('2026-06')
    expect(calendar.year).toBe(2026)
    expect(calendar.month).toBe(6)
    expect(calendar.dates).toContain(15)
    expect(calendar.dates).not.toContain(20)
  })
})
