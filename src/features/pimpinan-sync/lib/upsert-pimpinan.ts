import { db } from '@/shared/lib/db'
import { pimpinan } from '../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

interface PimpinanPayload {
  source_id: string
  nama: string
  jabatan: string
  foto_url?: string | null
  bio?: string | null
  periode_mulai: string
  periode_selesai?: string | null
  urutan?: number
}

export async function upsertPimpinan(payload: PimpinanPayload) {
  const existingItems = await db.select().from(pimpinan).where(eq(pimpinan.source_id, payload.source_id)).limit(1)
  const existing = existingItems[0] || null

  const valuesToUpsert = {
    source_id: payload.source_id,
    nama: payload.nama,
    jabatan: payload.jabatan,
    foto_url: payload.foto_url || null,
    bio: payload.bio || null,
    periode_mulai: payload.periode_mulai,
    periode_selesai: payload.periode_selesai || null,
    urutan: payload.urutan !== undefined ? payload.urutan : 0,
    is_active: true,
    updated_at: new Date()
  }

  let action = "created"
  let id = ""

  if (existing) {
    await db.update(pimpinan)
      .set(valuesToUpsert)
      .where(eq(pimpinan.id, existing.id))
    id = existing.id
    action = "updated"
  } else {
    const inserted = await db.insert(pimpinan).values({
      ...valuesToUpsert,
      created_at: new Date()
    }).returning({ id: pimpinan.id })
    id = inserted[0].id
  }

  return { id, action }
}
