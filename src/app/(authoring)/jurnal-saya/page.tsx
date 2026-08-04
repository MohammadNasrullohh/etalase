import Link from 'next/link'
import { AlertCircle, CheckCircle2, Clock3, ExternalLink, Folder, Plus, UsersRound } from 'lucide-react'
import {
  getJurnalWorkspaceAction,
  type JurnalWorkspace,
  type MyJurnalItem,
} from '@/features/jurnal-saya/api/get-my-jurnals.action'
import { JournalReportDownload } from '@/features/jurnal-saya/ui/journal-report-download.client'
import { MyJurnalCard } from '@/features/jurnal-saya/ui/my-jurnal-card.client'

export const dynamic = 'force-dynamic'

function JournalSection({
  id,
  title,
  description,
  items,
  icon,
}: {
  id: string
  title: string
  description: string
  items: MyJurnalItem[]
  icon: React.ReactNode
}) {
  return (
    <section aria-labelledby={id}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-[var(--color-accent-hover)]">{icon}</div>
        <div>
          <h2 id={id} className="text-lg font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-white/50">{description}</p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => <MyJurnalCard key={`${item.source_id}-${item.status}-${item.scope}`} item={item} />)}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-9 text-center text-sm text-white/45">
          Belum ada jurnal pada bagian ini.
        </div>
      )}
    </section>
  )
}

export default async function JurnalSayaPage() {
  let workspace: JurnalWorkspace | null = null
  let error: string | null = null

  try {
    workspace = await getJurnalWorkspaceAction()
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Gagal memuat data jurnal'
  }

  if (!workspace) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 p-10 text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-red-300" />
          <h1 className="font-semibold text-red-200">Gagal memuat jurnal</h1>
          <p className="mt-1 text-sm text-red-200/75">{error}</p>
        </div>
      </div>
    )
  }

  const allItems = [...workspace.mine, ...workspace.subordinates]
  const publishedCount = allItems.filter((item) => item.status === 'published').length
  const pendingCount = allItems.filter((item) => item.status === 'draft' || item.status === 'publish_pending').length

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <header className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-accent-hover)]">Workspace jurnal</p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-[-0.025em] text-white">
            <Folder className="h-7 w-7" /> Jurnal Saya
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            Staf mengajukan jurnal, Kasubag meninjau, lalu jurnal yang disetujui masuk proses publish ke ALAS. Perubahan data tetap dikerjakan di Lawet Hub sebagai sumber utama.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/lawet?to=manage" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white">
            Kelola CRUD <ExternalLink className="h-4 w-4" />
          </Link>
          <Link href="/lawet?to=submit" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-text-on-accent)] hover:bg-[var(--color-accent-hover)]">
            <Plus className="h-4 w-4" /> Tambah jurnal
          </Link>
        </div>
      </header>

      {workspace.warnings.length > 0 ? (
        <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/80" role="status">
          Data ditampilkan sebagian. {workspace.warnings.join(' ')}
        </div>
      ) : null}

      <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Ringkasan jurnal">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs text-white/45">Jurnal saya</p><p className="mt-1 text-2xl font-semibold text-white">{workspace.mine.length}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="flex items-center gap-1.5 text-xs text-white/45"><Clock3 className="h-3.5 w-3.5" /> Menunggu proses</p><p className="mt-1 text-2xl font-semibold text-amber-300">{pendingCount}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="flex items-center gap-1.5 text-xs text-white/45"><CheckCircle2 className="h-3.5 w-3.5" /> Sudah terbit</p><p className="mt-1 text-2xl font-semibold text-emerald-300">{publishedCount}</p></div>
      </section>

      <div className="mt-8">
        <JournalReportDownload
          items={allItems}
          generatedBy={workspace.viewerName}
          divisionName={workspace.divisionName}
          canReview={workspace.canReview}
        />
      </div>

      <div className="mt-10 space-y-12">
        <JournalSection
          id="mine-heading"
          title="Jurnal milik saya"
          description="Draft dapat diedit atau dihapus melalui Lawet Hub. Jurnal terbit tetap tersedia sebagai riwayat laporan."
          items={workspace.mine}
          icon={<Folder className="h-5 w-5" />}
        />
        {workspace.canReview ? (
          <JournalSection
            id="subordinates-heading"
            title="Jurnal bawahan"
            description={`Draft yang menunggu review dan jurnal terbit staf${workspace.divisionName ? ` di ${workspace.divisionName}` : ' dalam cakupan Anda'}.`}
            items={workspace.subordinates}
            icon={<UsersRound className="h-5 w-5" />}
          />
        ) : null}
      </div>
    </div>
  )
}
