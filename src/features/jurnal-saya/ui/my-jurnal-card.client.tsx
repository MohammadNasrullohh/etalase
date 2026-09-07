'use client'

import Link from 'next/link'
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FilePenLine,
  FileText,
  ShieldCheck,
  Trash2,
  UserRound,
  XCircle,
} from 'lucide-react'
import type { JurnalWorkflowStatus, MyJurnalItem } from '../api/get-my-jurnals.action'

const CATEGORY_LABELS: Record<string, string> = {
  mou: 'MoU & Kerjasama',
  koordinasi: 'Koordinasi',
  sosialisasi: 'Sosialisasi',
  pembinaan: 'Pembinaan',
  pengawasan: 'Pengawasan',
  rapat: 'Rapat Internal',
  sengketa: 'Sengketa',
  pelaporan: 'Pelaporan',
  lainnya: 'Lain-lain',
}

const STATUS_META: Record<JurnalWorkflowStatus, {
  label: string
  className: string
  icon: typeof Clock
}> = {
  draft: {
    label: 'Menunggu approval',
    className: 'border-amber-600/30 bg-amber-50 text-amber-800',
    icon: Clock,
  },
  rejected: {
    label: 'Perlu diperbaiki',
    className: 'border-red-600/30 bg-red-50 text-red-800',
    icon: XCircle,
  },
  publish_pending: {
    label: 'Proses terbit',
    className: 'border-sky-600/30 bg-sky-50 text-sky-800',
    icon: Clock,
  },
  published: {
    label: 'Terbit publik',
    className: 'border-emerald-600/30 bg-emerald-50 text-emerald-800',
    icon: CheckCircle2,
  },
  unpublish_pending: {
    label: 'Proses unpublish',
    className: 'border-orange-600/30 bg-orange-50 text-orange-800',
    icon: Clock,
  },
  deleted: {
    label: 'Dihapus',
    className: 'border-[var(--glass-border-subtle)] bg-[var(--color-canvas)] text-[var(--color-text-muted)]',
    icon: Trash2,
  },
}

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function MyJurnalCard({ item }: { item: MyJurnalItem }) {
  const status = STATUS_META[item.status]
  const StatusIcon = status.icon
  const canEdit = item.scope === 'mine' && (item.status === 'draft' || item.status === 'rejected')
  const isPendingReview = item.scope === 'subordinate' && item.status === 'draft'

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--glass-border-subtle)] bg-[var(--color-surface-raised)] p-5 shadow-sm transition-all hover:border-[var(--glass-border-default)] hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-md border border-[var(--glass-border-subtle)] bg-[var(--color-canvas)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-primary)]">
          <FileText className="mr-1.5 h-3.5 w-3.5" />
          {CATEGORY_LABELS[item.kategori] || item.kategori}
        </span>
        <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${status.className}`}>
          <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
          {status.label}
        </span>
      </div>

      <h3 className="mt-4 line-clamp-2 flex-1 text-base font-semibold leading-snug text-[var(--color-text-primary)]">{item.judul}</h3>

      <div className="mt-4 space-y-2 border-t border-[var(--glass-border-subtle)] pt-4 text-sm text-[var(--color-text-muted)]">
        <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(item.tanggal_kegiatan)}</p>
        {item.owner_name ? <p className="flex items-center gap-2"><UserRound className="h-4 w-4" /><span className="text-[var(--color-text-primary)] font-medium">{item.owner_name}</span>{item.divisi ? ` · ${item.divisi}` : ''}</p> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {canEdit ? (
          <Link href={`/lawet?to=edit&id=${encodeURIComponent(item.source_id)}`} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-3 text-xs font-semibold text-[var(--color-text-on-accent)] hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm">
            <FilePenLine className="h-4 w-4" /> Edit
          </Link>
        ) : null}
        {isPendingReview ? (
          <Link href={`/approval/${encodeURIComponent(item.source_id)}`} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-3 text-xs font-semibold text-[var(--color-text-on-accent)] hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm">
            <ShieldCheck className="h-4 w-4" /> Review
          </Link>
        ) : null}
        <Link href={`/lawet?to=${isPendingReview ? 'approval' : 'manage'}&id=${encodeURIComponent(item.source_id)}`} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--glass-border-default)] bg-[var(--color-surface-overlay)] px-3 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-raised)] transition-colors shadow-sm">
          {canEdit ? <Trash2 className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
          {canEdit ? 'Kelola / Hapus' : isPendingReview ? 'Proses di Lawet' : 'Buka di Lawet'}
        </Link>
      </div>
    </article>
  )
}
