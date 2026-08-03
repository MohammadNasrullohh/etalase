'use client'

import Link from 'next/link'
import { ExternalLink, FileText, ShieldCheck } from 'lucide-react'

export function JurnalSubmitForm() {
  return (
    <div className="glass-surface relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 p-6 shadow-2xl md:p-8">
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-[var(--color-ember-bright)] to-transparent opacity-50" />
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-[var(--color-ember-bright)]/10 p-3 text-[var(--color-ember-bright)]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <FileText className="h-5 w-5" /> Pengajuan dikelola di Lawet Hub
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
            Sesi ALAS bersifat read-only untuk visibilitas dashboard. Buat pengajuan,
            unggah dokumen, dan ubah data pada aplikasi sumber Lawet Hub.
          </p>
          <Link
            href="/lawet?to=submit"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-ember-bright)] px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-white"
          >
            Buka form di Lawet Hub <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
