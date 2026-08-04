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
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-base)] px-6 text-white">
      <div className="max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
        <h1 className="text-xl font-semibold">Lawet Hub belum dikonfigurasi</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Administrator perlu mengisi LAWET_PUBLIC_URL agar tautan workflow dapat dibuka.
        </p>
        <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-white/15 px-5 text-sm font-semibold hover:bg-white/[0.06]">
          Kembali ke ALAS
        </Link>
      </div>
    </main>
  )
}
