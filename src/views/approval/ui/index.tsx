import { ApprovalQueue } from '@/features/jurnal-approval/ui/approval-queue.client'
import { ShieldCheck } from 'lucide-react'

export function ApprovalView() {
  return (
    <div className="min-h-screen bg-[var(--color-base)] py-16 px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-yellow-500/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <header className="mb-12 flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white font-mono tracking-tighter mb-2 uppercase flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-[var(--color-ember-bright)]" />
              ALAS <span className="text-[var(--color-ember-bright)]">Approval</span>
            </h1>
            <p className="text-gray-400">
              Dashboard persetujuan jurnal (Terhubung ke Lawet Hub)
            </p>
          </div>
        </header>

        <ApprovalQueue />
      </div>
    </div>
  )
}
