import { db } from '@/shared/lib/db'
import { jurnal } from '../../../../drizzle/schema'
import { sql, eq, and, isNotNull } from 'drizzle-orm'

export interface JurnalStats {
  years: number[]
  stats: Record<string, number>
}

/** Ambil semua tahun yang punya data jurnal published */
export async function getJurnalYears(): Promise<number[]> {
  const rows = await db
    .select({
      year: sql<number>`EXTRACT(YEAR FROM ${jurnal.tanggal_kegiatan})::int`,
    })
    .from(jurnal)
    .where(eq(jurnal.is_published, true))
    .groupBy(sql`EXTRACT(YEAR FROM ${jurnal.tanggal_kegiatan})`)
    .orderBy(sql`EXTRACT(YEAR FROM ${jurnal.tanggal_kegiatan})`)

  return rows.map(r => r.year)
}

/** Hitung jumlah jurnal per kategori untuk tahun tertentu */
export async function getJurnalStatsByYear(year: number): Promise<Record<string, number>> {
  const rows = await db
    .select({
      kategori: jurnal.kategori,
      total: sql<number>`COUNT(*)::int`,
    })
    .from(jurnal)
    .where(
      and(
        eq(jurnal.is_published, true),
        sql`EXTRACT(YEAR FROM ${jurnal.tanggal_kegiatan}) = ${year}`
      )
    )
    .groupBy(jurnal.kategori)

  return Object.fromEntries(rows.map(r => [r.kategori, r.total]))
}
