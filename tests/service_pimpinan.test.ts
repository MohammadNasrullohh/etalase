import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/shared/lib/db'
import { pimpinan } from '../drizzle/schema'
import { eq } from 'drizzle-orm'
import { upsertPimpinan } from '@/features/pimpinan-sync/lib/upsert-pimpinan'

describe('Service Pimpinan CRUD Integration', () => {
  const testSourceId = '88888888-9999-aaaa-bbbb-cccccccccccc'

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://alas_user:change-this-strong-password@localhost:5433/alas'
    await db.delete(pimpinan).where(eq(pimpinan.source_id, testSourceId))
  })

  afterAll(async () => {
    await db.delete(pimpinan).where(eq(pimpinan.source_id, testSourceId))
  })

  it('should insert new Pimpinan (action: created)', async () => {
    const payload = {
      source_id: testSourceId,
      nama: 'Test Komisioner',
      jabatan: 'Anggota',
      foto_url: 'https://media.com/foto.jpg',
      bio: 'Profil lengkap test.',
      periode_mulai: '2023-08-15',
      periode_selesai: '2028-08-14',
      urutan: 2
    }

    const res = await upsertPimpinan(payload)
    expect(res.action).toBe('created')

    const dbItems = await db.select().from(pimpinan).where(eq(pimpinan.source_id, testSourceId)).limit(1)
    expect(dbItems.length).toBe(1)
    expect(dbItems[0].nama).toBe('Test Komisioner')
    expect(dbItems[0].urutan).toBe(2)
  })

  it('should upsert Pimpinan (action: updated)', async () => {
    const payload = {
      source_id: testSourceId,
      nama: 'Test Komisioner Updated',
      jabatan: 'Ketua',
      foto_url: 'https://media.com/foto.jpg',
      bio: 'Profil lengkap test.',
      periode_mulai: '2023-08-15',
      periode_selesai: '2028-08-14',
      urutan: 1
    }

    const res = await upsertPimpinan(payload)
    expect(res.action).toBe('updated')

    const dbItems = await db.select().from(pimpinan).where(eq(pimpinan.source_id, testSourceId)).limit(1)
    expect(dbItems.length).toBe(1)
    expect(dbItems[0].nama).toBe('Test Komisioner Updated')
    expect(dbItems[0].jabatan).toBe('Ketua')
    expect(dbItems[0].urutan).toBe(1)
  })
})
