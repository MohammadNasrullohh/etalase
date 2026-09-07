import { ApprovalQueue } from '@/features/jurnal-approval/ui/approval-queue.client'
import { ShieldCheck } from 'lucide-react'
import { SiteTitle } from '@/entities/site-settings/ui/site-title.client'

export function ApprovalView() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] py-16 px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-[var(--color-accent)]/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <header className="mb-12 flex items-center justify-between border-b border-[var(--glass-border-subtle)] pb-6">
          <div>
            <h1 className="text-3xl font-black text-[var(--color-text-primary)] font-mono tracking-tighter mb-2 uppercase flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[var(--color-accent-hover)]" />
              <SiteTitle /> <span className="text-[var(--color-category-amber-text)]">Approval</span>
            </h1>
            <p className="text-[var(--color-text-muted)]">
              Dashboard persetujuan jurnal (Terhubung ke Lawet Hub)
            </p>
          </div>
        </header>

        <ApprovalQueue />
      </div>
    </div>
  )
}
