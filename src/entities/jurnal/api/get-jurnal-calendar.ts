import { db } from '@/shared/lib/db'
import { jurnal } from '../../../../drizzle/schema'
import { and, eq, sql } from 'drizzle-orm'

export async function getJurnalCalendar(month: string) {
  // month format YYYY-MM
  const results = await db.select({
    tanggal: jurnal.tanggal_kegiatan
  })
  .from(jurnal)
  .where(
    and(
      eq(jurnal.is_published, true),
      sql`TO_CHAR(${jurnal.tanggal_kegiatan}, 'YYYY-MM') = ${month}`
    )
  )
  .orderBy(jurnal.tanggal_kegiatan)

  const days = results.map(r => {
    // If it's a string YYYY-MM-DD
    if (typeof r.tanggal === 'string') {
      return parseInt(r.tanggal.split('-')[2], 10)
    }
    // If it's a Date object
    const d = new Date(r.tanggal)
    return d.getUTCDate() // use UTC to avoid local timezone offset shifts
  })

  const dates = Array.from(new Set(days)).sort((a, b) => a - b)
  const [yearStr, monthStr] = month.split('-')

  return {
    year: parseInt(yearStr, 10),
    month: parseInt(monthStr, 10),
    dates,
    total_entries: dates.length
  }
}
