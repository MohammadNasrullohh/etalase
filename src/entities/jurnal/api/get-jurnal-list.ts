import { db } from '@/shared/lib/db'
import { jurnal } from '../../../../drizzle/schema'
import { and, eq, ilike, or, lt, sql } from 'drizzle-orm'

interface GetJurnalListParams {
  q?: string
  kategori?: string
  cursor?: string
  limit?: number
}

export async function getJurnalList({ q = '', kategori = '', cursor = '', limit = 20 }: GetJurnalListParams) {
  let conditions = [eq(jurnal.is_published, true)]

  if (kategori) {
    conditions.push(eq(jurnal.kategori, kategori))
  }

  if (q) {
    conditions.push(
      or(
        ilike(jurnal.judul, `%${q}%`),
        sql`${jurnal.pihak_terkait}::text ILIKE ${`%${q}%`}`
      )!
    )
  }

  if (cursor) {
    const cursorItem = await db.select().from(jurnal).where(eq(jurnal.id, cursor)).limit(1)
    if (cursorItem.length > 0) {
      const item = cursorItem[0]
      conditions.push(
        or(
          lt(jurnal.tanggal_kegiatan, item.tanggal_kegiatan),
          and(
            eq(jurnal.tanggal_kegiatan, item.tanggal_kegiatan),
            lt(jurnal.id, item.id)
          )
        )!
      )
    }
  }

  const items = await db.select()
    .from(jurnal)
    .where(and(...conditions))
    .orderBy(sql`${jurnal.tanggal_kegiatan} DESC`, sql`${jurnal.id} DESC`)
    .limit(limit + 1)

  return items
}
