import Link from 'next/link'
import { redirect } from 'next/navigation'
import { buildLawetWorkflowUrl } from '@/features/jurnal-saya/lib/lawet-workflow'

export default function LawetRedirectPage({
  searchParams,
}: {
  searchParams: { to?: string; id?: string }
}) {
  const target = buildLawetWorkflowUrl(
    process.env.LAWET_PUBLIC_URL,
    searchParams.to,
    searchParams.id,
  )

  if (target) redirect(target)

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] px-6 text-[var(--color-text-primary)]">
      <div className="max-w-lg rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-8 text-center shadow-lg">
        <h1 className="text-xl font-serif font-bold">Lawet Hub belum dikonfigurasi</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
          Administrator perlu mengisi LAWET_PUBLIC_URL agar tautan workflow dapat dibuka.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-raised)] px-5 text-sm font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-border-default)] transition-colors"
        >
          Kembali ke ALAS
        </Link>
      </div>
    </main>
  )
}
