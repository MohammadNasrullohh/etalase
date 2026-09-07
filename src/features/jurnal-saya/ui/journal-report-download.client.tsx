'use client'

import { useMemo, useState } from 'react'
import { FileDown } from 'lucide-react'
import type { MyJurnalItem } from '../api/get-my-jurnals.action'
import {
  buildJournalReportHtml,
  filterJournalReportItems,
  type JournalReportScope,
} from '../lib/journal-report'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

interface Props {
  items: MyJurnalItem[]
  generatedBy: string
  divisionName?: string
  canReview: boolean
}

export function JournalReportDownload({ items, generatedBy, divisionName, canReview }: Props) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [scope, setScope] = useState<JournalReportScope>(canReview ? 'all' : 'mine')

  const reportCount = useMemo(
    () => filterJournalReportItems(items, { month, year, scope }).length,
    [items, month, scope, year],
  )

  function printReport() {
    const frame = document.createElement('iframe')
    frame.setAttribute('title', 'Laporan jurnal untuk dicetak')
    frame.style.position = 'fixed'
    frame.style.width = '0'
    frame.style.height = '0'
    frame.style.border = '0'
    frame.style.right = '0'
    frame.style.bottom = '0'
    document.body.appendChild(frame)

    const documentToPrint = frame.contentDocument
    if (!documentToPrint) {
      frame.remove()
      return
    }

    documentToPrint.open()
    documentToPrint.write(buildJournalReportHtml(items, {
      month,
      year,
      scope,
      generatedBy,
      divisionName,
    }))
    documentToPrint.close()

    frame.contentWindow?.focus()
    frame.contentWindow?.print()
    window.setTimeout(() => frame.remove(), 60_000)
  }

  return (
    <section className="rounded-2xl border border-[var(--glass-border-subtle)] bg-[var(--color-surface-raised)] p-5 shadow-sm" aria-labelledby="journal-report-title">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[var(--color-accent)]/15 p-2.5 text-[var(--color-accent-hover)]">
          <FileDown className="h-5 w-5" />
        </div>
        <div>
          <h2 id="journal-report-title" className="font-semibold text-[var(--color-text-primary)]">Laporan PDF jurnal</h2>
          <p className="mt-1 text-sm leading-5 text-[var(--color-text-muted)]">Rekap jurnal yang sudah terbit dalam format F4 portrait.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-medium text-[var(--color-text-muted)]">
          Bulan
          <select value={month} onChange={(event) => setMonth(Number(event.target.value))} className="mt-1.5 min-h-11 w-full rounded-xl border border-[var(--glass-border-default)] bg-[var(--color-surface-overlay)] px-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]">
            {MONTHS.map((label, index) => <option key={label} value={index + 1}>{label}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-[var(--color-text-muted)]">
          Tahun
          <select value={year} onChange={(event) => setYear(Number(event.target.value))} className="mt-1.5 min-h-11 w-full rounded-xl border border-[var(--glass-border-default)] bg-[var(--color-surface-overlay)] px-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]">
            {[year - 1, year, year + 1].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-[var(--color-text-muted)]">
          Cakupan
          <select value={scope} onChange={(event) => setScope(event.target.value as JournalReportScope)} className="mt-1.5 min-h-11 w-full rounded-xl border border-[var(--glass-border-default)] bg-[var(--color-surface-overlay)] px-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]">
            <option value="mine">Jurnal Saya</option>
            {canReview ? <option value="subordinate">Jurnal Bawahan</option> : null}
            {canReview ? <option value="all">Semua yang Terlihat</option> : null}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={printReport}
        disabled={reportCount === 0}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-text-on-accent)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <FileDown className="h-4 w-4" />
        {reportCount > 0 ? `Unduh PDF (${reportCount} jurnal)` : 'Tidak ada jurnal terbit'}
      </button>
    </section>
  )
}
