import { db } from '@/shared/lib/db'
import { pimpinan } from '../../../../drizzle/schema'
import { and, eq, lte, gte, or, isNull } from 'drizzle-orm'

export async function getPimpinanList(activeDate: string) {
  const results = await db.select({
    id: pimpinan.id,
    source_id: pimpinan.source_id,
    nama: pimpinan.nama,
    jabatan: pimpinan.jabatan,
    foto_url: pimpinan.foto_url,
    periode_mulai: pimpinan.periode_mulai,
    periode_selesai: pimpinan.periode_selesai,
    urutan: pimpinan.urutan,
  })
  .from(pimpinan)
  .where(
    and(
      eq(pimpinan.is_active, true),
      lte(pimpinan.periode_mulai, activeDate),
      or(
        isNull(pimpinan.periode_selesai),
        gte(pimpinan.periode_selesai, activeDate)
      )
    )
  )
  .orderBy(pimpinan.urutan)

  return results
}
