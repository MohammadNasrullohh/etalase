import { db } from '@/shared/lib/db'
import { jurnal } from '../../../../drizzle/schema'
import { and, eq, ilike, or, lt, sql } from 'drizzle-orm'

interface GetJurnalListParams {
  q?: string
  kategori?: string
  cursor?: string
  limit?: number
  date?: string
}

type CursorItem = Pick<typeof jurnal.$inferSelect, 'id' | 'tanggal_kegiatan'>

export function encodeJurnalCursor(item: CursorItem): string {
  return Buffer.from(`${item.tanggal_kegiatan}|${item.id}`).toString('base64url')
}

function decodeJurnalCursor(cursor: string): CursorItem | null {
  try {
    const [tanggal_kegiatan, id] = Buffer.from(cursor, 'base64url').toString('utf8').split('|')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal_kegiatan) || !/^[0-9a-f-]{36}$/i.test(id)) {
      return null
    }
    return { tanggal_kegiatan, id }
  } catch {
    return null
  }
}

export async function getJurnalList({ q = '', kategori = '', cursor = '', limit = 20, date = '' }: GetJurnalListParams) {
  let conditions = [eq(jurnal.is_published, true)]

  if (date) {
    conditions.push(eq(jurnal.tanggal_kegiatan, date))
  }

  if (kategori) {
    conditions.push(eq(jurnal.kategori, kategori))
  }

  if (q) {
    conditions.push(
      or(
        ilike(jurnal.judul, `%${q}%`),
        sql`${jurnal.pihak_terkait}::text ILIKE ${`%${q}%`}`,
        sql`${jurnal.tags}::text ILIKE ${`%${q}%`}`
      )!
    )
  }

  const cursorItem = cursor ? decodeJurnalCursor(cursor) : null
  if (cursorItem) {
    conditions.push(
      or(
        lt(jurnal.tanggal_kegiatan, cursorItem.tanggal_kegiatan),
        and(
          eq(jurnal.tanggal_kegiatan, cursorItem.tanggal_kegiatan),
          lt(jurnal.id, cursorItem.id)
        )
      )!
    )
  }

  // Daftar publik hanya mengambil kolom yang benar-benar dikirim ke kartu jurnal.
  const items = await db.select({
    id: jurnal.id,
    source_id: jurnal.source_id,
    judul: jurnal.judul,
    tanggal_kegiatan: jurnal.tanggal_kegiatan,
    kategori: jurnal.kategori,
    link_publikasi: jurnal.link_publikasi,
    dokumentasi: jurnal.dokumentasi,
    dokumen_pendukung: jurnal.dokumen_pendukung,
    pihak_terkait: jurnal.pihak_terkait,
    custom_fields: jurnal.custom_fields,
    tags: jurnal.tags,
    redaksi: jurnal.redaksi,
    created_at: jurnal.created_at,
  })
    .from(jurnal)
    .where(and(...conditions))
    .orderBy(sql`${jurnal.tanggal_kegiatan} DESC`, sql`${jurnal.id} DESC`)
    .limit(limit + 1)

  return items
}
