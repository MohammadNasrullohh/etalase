import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, ExternalLink, FileText, Tags, UsersRound } from 'lucide-react'
import { getApprovalJurnalAction } from '@/entities/jurnal/api/approve-jurnal.action'
import { JurnalProgressTracker } from '@/features/jurnal-approval/ui/jurnal-progress-tracker'
import { ApprovalActions } from '@/features/jurnal-approval/ui/approval-actions.client'

/* Foto melewati proxy media terautentikasi; pengoptimal gambar Next tidak dapat meneruskan cookie sesi. */
/* eslint-disable @next/next/no-img-element */

type JurnalDetail = {
  judul: string
  tanggal_kegiatan: string
  kategori: string
  ringkasan?: string | null
  created_by?: string | null
  divisi?: string | null
  link_publikasi?: string | null
  dokumentasi?: Array<{ url?: string; caption?: string }>
  dokumen_pendukung?: Array<{ nama?: string; url?: string; tipe?: string; is_public?: boolean }>
  pihak_terkait?: Array<{ nama?: string; instansi?: string }>
  custom_fields?: Array<{ label?: string; value?: string }>
  tags?: string[]
  submitter?: { name?: string } | null
  created_at?: string | Date | null
}

function formatDate(value: string) {
  if (!value) return '—'
  const isoDate = value.includes('T') ? value : `${value}T00:00:00`
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(date)
}

export default async function ApprovalDetailPage({ params }: { params: { id: string } }) {
  const result = await getApprovalJurnalAction(params.id)
  if (!result.success || !result.data) notFound()
  const jurnal = result.data as unknown as JurnalDetail

  return (
    <section className="min-h-full bg-[var(--color-canvas-raised)] px-5 py-8 text-[var(--color-text-primary)] sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/approval" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Approval
        </Link>        <div className="mt-6 border-b border-[var(--glass-border-subtle)] pb-7">
          <p className="text-sm font-medium text-[var(--color-accent-hover)]">Menunggu persetujuan</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em] text-balance">{jurnal.judul}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-text-muted)]">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[var(--color-accent-hover)]" />{formatDate(jurnal.tanggal_kegiatan)}</span>
            <span className="inline-flex items-center gap-2"><Tags className="h-4 w-4 text-[var(--color-accent-hover)]" />{jurnal.kategori}</span>
            {jurnal.created_by ? <span className="inline-flex items-center gap-2"><UsersRound className="h-4 w-4 text-[var(--color-accent-hover)]" />{jurnal.submitter?.name ?? jurnal.created_by}</span> : null}
          </div>
        </div>

        {jurnal.ringkasan && (
          <div className="mt-8 text-[15px] leading-[1.75] text-[var(--color-text-primary)]">
            {jurnal.ringkasan}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-8">
            {jurnal.dokumentasi?.length ? (
              <section>
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Dokumentasi</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {jurnal.dokumentasi.map((foto, index) => (
                    <figure key={`${foto.url}-${index}`} className="overflow-hidden rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--color-surface-overlay)] shadow-sm">
                      {foto.url ? <img src={foto.url} alt={foto.caption || `Dokumentasi ${index + 1}`} loading="lazy" decoding="async" className="aspect-video w-full object-cover" /> : null}
                      {foto.caption ? <figcaption className="px-3 py-2 text-sm text-[var(--color-text-muted)]">{foto.caption}</figcaption> : null}
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}

            {jurnal.dokumen_pendukung?.length ? (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]"><FileText className="h-5 w-5 text-[var(--color-accent-hover)]" />Dokumen pendukung</h2>
                <div className="mt-3 divide-y divide-[var(--glass-border-subtle)] rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--color-surface-raised)] shadow-sm">
                  {jurnal.dokumen_pendukung.map((dokumen, index) => (
                    <a key={`${dokumen.url}-${index}`} href={dokumen.url} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-between gap-4 px-4 text-sm text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-canvas-raised)]">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="truncate">{dokumen.nama || `Dokumen ${index + 1}`}</span>
                        {dokumen.is_public ? (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 border border-emerald-500/20">Publik</span>
                        ) : (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 border border-amber-500/20">Internal</span>
                        )}
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6">
            <JurnalProgressTracker submittedBy={jurnal.submitter?.name || jurnal.created_by} submittedAt={jurnal.created_at ? (typeof jurnal.created_at === 'string' ? jurnal.created_at : jurnal.created_at.toISOString()) : undefined} />
            <ApprovalActions jurnalId={params.id} />
            <section className="rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--color-surface-raised)] p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Ringkasan kegiatan</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="text-[var(--color-text-muted)]">Kategori</dt><dd className="mt-1 capitalize text-[var(--color-text-primary)]">{jurnal.kategori}</dd></div>
                {jurnal.link_publikasi ? <div><dt className="text-[var(--color-text-muted)]">Publikasi</dt><dd className="mt-1"><a href={jurnal.link_publikasi} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[var(--color-accent-hover)] hover:underline">Buka tautan <ExternalLink className="h-3.5 w-3.5" /></a></dd></div> : null}
              </dl>
            </section>

            {jurnal.tags?.length ? <section className="rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--color-surface-raised)] p-5 shadow-sm"><h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]"><Tags className="h-4 w-4 text-[var(--color-accent-hover)]" />Tags</h2><div className="mt-3 flex flex-wrap gap-2">{jurnal.tags.map((tag) => <span key={tag} className="rounded-full border border-[var(--glass-border-subtle)] bg-[var(--color-canvas)] px-2.5 py-1 text-xs text-[var(--color-text-primary)]">{tag}</span>)}</div></section> : null}
            {jurnal.pihak_terkait?.length ? <section className="rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--color-surface-raised)] p-5 shadow-sm"><h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]"><UsersRound className="h-4 w-4 text-[var(--color-accent-hover)]" />Pihak terkait</h2><ul className="mt-3 space-y-2 text-sm text-[var(--color-text-muted)]">{jurnal.pihak_terkait.map((pihak, index) => <li key={`${pihak.nama}-${index}`}><span className="text-[var(--color-text-primary)] font-medium">{pihak.nama}</span>{pihak.instansi ? ` · ${pihak.instansi}` : ''}</li>)}</ul></section> : null}
            {jurnal.custom_fields?.length ? <section className="rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--color-surface-raised)] p-5 shadow-sm"><h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Informasi tambahan</h2><dl className="mt-3 space-y-2 text-sm">{jurnal.custom_fields.map((field, index) => <div key={`${field.label}-${index}`}><dt className="text-[var(--color-text-muted)]">{field.label}</dt><dd className="mt-0.5 text-[var(--color-text-primary)]">{field.value}</dd></div>)}</dl></section> : null}
          </aside>
        </div>
      </div>
    </section>
  )
}
