import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, ExternalLink, FileText, Tags, UsersRound } from 'lucide-react'
import { getApprovalJurnalAction } from '@/entities/jurnal/api/approve-jurnal.action'
import { JurnalProgressTracker } from '@/features/jurnal-approval/ui/jurnal-progress-tracker'

/* Foto melewati proxy media terautentikasi; pengoptimal gambar Next tidak dapat meneruskan cookie sesi. */
/* eslint-disable @next/next/no-img-element */

type JurnalDetail = {
  judul: string
  tanggal_kegiatan: string
  kategori: string
  created_by?: string | null
  divisi?: string | null
  link_publikasi?: string | null
  dokumentasi?: Array<{ url?: string; caption?: string }>
  dokumen_pendukung?: Array<{ nama?: string; url?: string; tipe?: string }>
  pihak_terkait?: Array<{ nama?: string; instansi?: string }>
  custom_fields?: Array<{ label?: string; value?: string }>
  tags?: string[]
  submitter?: { name?: string } | null
  created_at?: string | null
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date(`${value}T00:00:00`))
}

export default async function ApprovalDetailPage({ params }: { params: { id: string } }) {
  const result = await getApprovalJurnalAction(params.id)
  if (!result.success || !result.data) notFound()
  const jurnal = result.data as JurnalDetail

  return (
    <section className="min-h-full bg-[#090A0D] px-5 py-8 text-white sm:px-8 lg:px-12 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/approval" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Approval
        </Link>

        <div className="mt-6 border-b border-white/10 pb-7">
          <p className="text-sm font-medium text-[#FF8A6C]">Menunggu persetujuan</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em] text-balance">{jurnal.judul}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#FF8A6C]" />{formatDate(jurnal.tanggal_kegiatan)}</span>
            <span>Oleh: {jurnal.submitter?.name || jurnal.created_by || '—'}</span>
            <span>Divisi: {jurnal.divisi || '—'}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-8">
            {jurnal.dokumentasi?.length ? (
              <section>
                <h2 className="text-lg font-semibold">Dokumentasi</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {jurnal.dokumentasi.map((foto, index) => (
                    <figure key={`${foto.url}-${index}`} className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                      {foto.url ? <img src={foto.url} alt={foto.caption || `Dokumentasi ${index + 1}`} loading="lazy" decoding="async" className="aspect-video w-full object-cover" /> : null}
                      {foto.caption ? <figcaption className="px-3 py-2 text-sm text-white/65">{foto.caption}</figcaption> : null}
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}

            {jurnal.dokumen_pendukung?.length ? (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold"><FileText className="h-5 w-5 text-[#FF8A6C]" />Dokumen pendukung</h2>
                <div className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
                  {jurnal.dokumen_pendukung.map((dokumen, index) => (
                    <a key={`${dokumen.url}-${index}`} href={dokumen.url} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-between gap-4 px-4 text-sm text-white/75 transition-colors hover:bg-white/[0.04] hover:text-white">
                      <span>{dokumen.nama || `Dokumen ${index + 1}`}</span><ExternalLink className="h-4 w-4 shrink-0 text-white/45" />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6">
            <JurnalProgressTracker submittedBy={jurnal.submitter?.name || jurnal.created_by} submittedAt={jurnal.created_at} />
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-sm font-semibold text-white/85">Ringkasan kegiatan</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="text-white/45">Kategori</dt><dd className="mt-1 capitalize">{jurnal.kategori}</dd></div>
                {jurnal.link_publikasi ? <div><dt className="text-white/45">Publikasi</dt><dd className="mt-1"><a href={jurnal.link_publikasi} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#FF8A6C] hover:text-white">Buka tautan <ExternalLink className="h-3.5 w-3.5" /></a></dd></div> : null}
              </dl>
            </section>

            {jurnal.tags?.length ? <section><h2 className="flex items-center gap-2 text-sm font-semibold"><Tags className="h-4 w-4 text-[#FF8A6C]" />Tags</h2><div className="mt-3 flex flex-wrap gap-2">{jurnal.tags.map((tag) => <span key={tag} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/70">{tag}</span>)}</div></section> : null}
            {jurnal.pihak_terkait?.length ? <section><h2 className="flex items-center gap-2 text-sm font-semibold"><UsersRound className="h-4 w-4 text-[#FF8A6C]" />Pihak terkait</h2><ul className="mt-3 space-y-2 text-sm text-white/65">{jurnal.pihak_terkait.map((pihak, index) => <li key={`${pihak.nama}-${index}`}><span className="text-white/85">{pihak.nama}</span>{pihak.instansi ? ` · ${pihak.instansi}` : ''}</li>)}</ul></section> : null}
            {jurnal.custom_fields?.length ? <section><h2 className="text-sm font-semibold">Informasi tambahan</h2><dl className="mt-3 space-y-2 text-sm">{jurnal.custom_fields.map((field, index) => <div key={`${field.label}-${index}`}><dt className="text-white/45">{field.label}</dt><dd className="mt-0.5 text-white/75">{field.value}</dd></div>)}</dl></section> : null}
          </aside>
        </div>
      </div>
    </section>
  )
}
