import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/shared/lib/db'
import { jurnal } from '../drizzle/schema'
import { eq } from 'drizzle-orm'
import { upsertJurnal } from '@/features/jurnal-sync/lib/upsert-jurnal'

describe('Service Jurnal CRUD Integration', () => {
  const testSourceId = '11111111-2222-3333-4444-555555555555'

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://alas_user:change-this-strong-password@localhost:5433/alas'
    await db.delete(jurnal).where(eq(jurnal.source_id, testSourceId))
  })

  afterAll(async () => {
    await db.delete(jurnal).where(eq(jurnal.source_id, testSourceId))
  })

  it('should insert new Jurnal (action: created)', async () => {
    const payload = {
      source_id: testSourceId,
      judul: 'Test Jurnal Kegiatan',
      tanggal_kegiatan: '2026-06-15',
      kategori: 'mou',
      dokumen_pendukung: [
        { nama: 'Doc 1', url: 'https://media.com/doc1.pdf', tipe: 'pdf' },
      ],
    }

    const res = await upsertJurnal(payload)
    expect(res.action).toBe('created')

    const dbItems = await db.select().from(jurnal).where(eq(jurnal.source_id, testSourceId)).limit(1)
    expect(dbItems.length).toBe(1)
    expect(dbItems[0].judul).toBe('Test Jurnal Kegiatan')
    const docs = dbItems[0].dokumen_pendukung as any[]
    expect(docs[0].is_public).toBe(true)
  })

  it('should upsert Jurnal (action: updated) and merge is_public values', async () => {
    const dbItemsBefore = await db.select().from(jurnal).where(eq(jurnal.source_id, testSourceId)).limit(1)
    const existing = dbItemsBefore[0]
    const existingDocs = existing.dokumen_pendukung as any[]
    existingDocs[0].is_public = false
    await db.update(jurnal).set({ dokumen_pendukung: existingDocs }).where(eq(jurnal.id, existing.id))

    const payload = {
      source_id: testSourceId,
      judul: 'Test Jurnal Kegiatan (Updated Title)',
      tanggal_kegiatan: '2026-06-15',
      kategori: 'mou',
      dokumen_pendukung: [
        { nama: 'Doc 1', url: 'https://media.com/doc1.pdf', tipe: 'pdf' },
        { nama: 'Doc 2', url: 'https://media.com/doc2.pdf', tipe: 'pdf' },
      ],
    }

    const res = await upsertJurnal(payload)
    expect(res.action).toBe('updated')

    const dbItemsAfter = await db.select().from(jurnal).where(eq(jurnal.source_id, testSourceId)).limit(1)
    const updatedDocs = dbItemsAfter[0].dokumen_pendukung as any[]
    
    expect(dbItemsAfter[0].judul).toBe('Test Jurnal Kegiatan (Updated Title)')
    expect(updatedDocs.length).toBe(2)
    const doc1 = updatedDocs.find(d => d.url === 'https://media.com/doc1.pdf')
    expect(doc1.is_public).toBe(false)
    const doc2 = updatedDocs.find(d => d.url === 'https://media.com/doc2.pdf')
    expect(doc2.is_public).toBe(true)
  })

  it('should remove missing documents on upsert', async () => {
    const payload = {
      source_id: testSourceId,
      judul: 'Test Jurnal Kegiatan',
      tanggal_kegiatan: '2026-06-15',
      kategori: 'mou',
      dokumen_pendukung: [
        { nama: 'Doc 2', url: 'https://media.com/doc2.pdf', tipe: 'pdf' },
      ],
    }

    await upsertJurnal(payload)
    const dbItems = await db.select().from(jurnal).where(eq(jurnal.source_id, testSourceId)).limit(1)
    const docs = dbItems[0].dokumen_pendukung as any[]
    
    expect(docs.length).toBe(1)
    expect(docs[0].url).toBe('https://media.com/doc2.pdf')
  })
})
