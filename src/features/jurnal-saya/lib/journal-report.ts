import type { JurnalScope, MyJurnalItem } from '../api/get-my-jurnals.action'

export type JournalReportScope = JurnalScope | 'all'

export interface JournalReportOptions {
  month: number
  year: number
  scope: JournalReportScope
  generatedBy: string
  divisionName?: string
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function escapeHtml(value: string | undefined): string {
  return (value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function safeLink(value: string | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

function formatDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function filterJournalReportItems(
  items: MyJurnalItem[],
  options: Pick<JournalReportOptions, 'month' | 'year' | 'scope'>,
): MyJurnalItem[] {
  const monthKey = `${options.year}-${String(options.month).padStart(2, '0')}`

  return items.filter((item) => item.status === 'published'
    && item.tanggal_kegiatan.startsWith(monthKey)
    && (options.scope === 'all' || item.scope === options.scope))
}

export function buildJournalReportHtml(
  items: MyJurnalItem[],
  options: JournalReportOptions,
): string {
  const reportItems = filterJournalReportItems(items, options)
  const reportScope = options.scope === 'mine'
    ? 'Jurnal Saya'
    : options.scope === 'subordinate'
      ? 'Jurnal Bawahan'
      : 'Semua Jurnal Terlihat'
  const generatedAt = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date())

  const ownerCounts = new Map<string, number>()
  for (const item of reportItems) {
    const owner = item.owner_name || 'Tidak diketahui'
    ownerCounts.set(owner, (ownerCounts.get(owner) || 0) + 1)
  }

  const recap = Array.from(ownerCounts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'id-ID'))
    .map(([name, count]) => `<span><strong>${escapeHtml(name)}</strong>: ${count} jurnal</span>`)
    .join('')

  const rows = reportItems.map((item, index) => {
    const publicationUrl = safeLink(item.link_publikasi)
    const publication = publicationUrl
      ? `<a href="${escapeHtml(publicationUrl)}">Buka publikasi</a>`
      : '-'

    return `<tr>
      <td class="number">${index + 1}</td>
      <td>${escapeHtml(item.owner_name || '-')}</td>
      <td>${escapeHtml(formatDate(item.tanggal_kegiatan))}</td>
      <td>${escapeHtml(item.judul)}</td>
      <td>${escapeHtml(item.kategori)}</td>
      <td>${escapeHtml(item.divisi || '-')}</td>
      <td>${publication}</td>
    </tr>`
  }).join('')

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Laporan Jurnal ALAS - ${escapeHtml(MONTHS[options.month - 1])} ${options.year}</title>
  <style>
    @page { size: 215mm 330mm portrait; margin: 18mm 14mm 22mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #172033; font: 11px/1.5 Arial, sans-serif; }
    header { border-bottom: 3px solid #ef5b3f; padding-bottom: 12px; margin-bottom: 16px; }
    h1 { margin: 0; color: #c33d27; font-size: 18px; letter-spacing: .03em; text-transform: uppercase; }
    header p { margin: 3px 0 0; color: #5f6b7a; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin-bottom: 16px; }
    .meta strong { color: #344054; }
    .recap { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-bottom: 18px; border-left: 4px solid #ef5b3f; background: #fff5f2; padding: 10px 12px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f2f4f7; color: #344054; font-size: 9px; letter-spacing: .04em; text-align: left; text-transform: uppercase; }
    th, td { border-bottom: 1px solid #dfe3e8; padding: 7px 6px; vertical-align: top; }
    tbody tr:nth-child(even) { background: #fafafa; }
    .number { width: 28px; text-align: center; }
    a { color: #175cd3; }
    footer { position: fixed; right: 0; bottom: 0; left: 0; border-top: 1px dashed #c8ced8; padding-top: 5px; color: #7b8493; font-size: 9px; text-align: center; }
  </style>
</head>
<body>
  <header>
    <h1>Laporan Rekapitulasi Jurnal ALAS</h1>
    <p>Bawaslu Kabupaten Kebumen</p>
  </header>
  <section class="meta">
    <div><strong>Periode:</strong> ${escapeHtml(MONTHS[options.month - 1])} ${options.year}</div>
    <div><strong>Cakupan:</strong> ${escapeHtml(reportScope)}</div>
    <div><strong>Divisi:</strong> ${escapeHtml(options.divisionName || '-')}</div>
    <div><strong>Dicetak oleh:</strong> ${escapeHtml(options.generatedBy)}</div>
    <div><strong>Total jurnal:</strong> ${reportItems.length}</div>
    <div><strong>Tanggal cetak:</strong> ${escapeHtml(generatedAt)}</div>
  </section>
  ${recap ? `<section class="recap">${recap}</section>` : ''}
  <table>
    <thead><tr><th class="number">No.</th><th>Staf</th><th>Tanggal</th><th>Judul</th><th>Kategori</th><th>Divisi</th><th>Publikasi</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="7">Tidak ada jurnal terbit pada periode ini.</td></tr>'}</tbody>
  </table>
  <footer>Generated by ALAS — Arsip Jurnal Bawaslu Kebumen</footer>
</body>
</html>`
}
