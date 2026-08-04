import { db } from '@/shared/lib/db'
import { pimpinan } from '../../../../drizzle/schema'
import { sql } from 'drizzle-orm'
import type { DatabaseExecutor } from '@/shared/lib/db'

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

export async function upsertPimpinan(payload: PimpinanPayload, database: DatabaseExecutor = db) {
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

  const [row] = await database.insert(pimpinan).values({
    ...valuesToUpsert,
    created_at: new Date()
  }).onConflictDoUpdate({
    target: pimpinan.source_id,
    set: valuesToUpsert,
  }).returning({
    id: pimpinan.id,
    created: sql<boolean>`xmax = 0`,
  })

  return { id: row.id, action: row.created ? "created" : "updated" }
}
