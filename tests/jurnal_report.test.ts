import { describe, expect, it } from 'vitest'
import {
  buildJournalReportHtml,
  filterJournalReportItems,
} from '@/features/jurnal-saya/lib/journal-report'
import type { MyJurnalItem } from '@/features/jurnal-saya/api/get-my-jurnals.action'

const items: MyJurnalItem[] = [
  {
    id: 'one',
    source_id: 'one',
    judul: 'Laporan <Humas>',
    tanggal_kegiatan: '2026-08-02',
    kategori: 'pelaporan',
    status: 'published',
    scope: 'mine',
    owner_name: 'Siti & Rekan',
    link_publikasi: 'https://example.test/report',
  },
  {
    id: 'two',
    source_id: 'two',
    judul: 'Draft belum terbit',
    tanggal_kegiatan: '2026-08-03',
    kategori: 'rapat',
    status: 'draft',
    scope: 'subordinate',
  },
  {
    id: 'three',
    source_id: 'three',
    judul: 'Bulan lain',
    tanggal_kegiatan: '2026-07-30',
    kategori: 'rapat',
    status: 'published',
    scope: 'subordinate',
  },
]

describe('Jurnal PDF report', () => {
  it('includes only published journals in the requested month and scope', () => {
    expect(filterJournalReportItems(items, { month: 8, year: 2026, scope: 'all' })).toEqual([items[0]])
    expect(filterJournalReportItems(items, { month: 8, year: 2026, scope: 'subordinate' })).toEqual([])
  })

  it('escapes user content in printable HTML', () => {
    const html = buildJournalReportHtml(items, {
      month: 8,
      year: 2026,
      scope: 'all',
      generatedBy: '<script>alert(1)</script>',
    })

    expect(html).toContain('Laporan &lt;Humas&gt;')
    expect(html).toContain('Siti &amp; Rekan')
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('https://example.test/report')
  })
})
