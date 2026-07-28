import { Check, Clock3, Circle } from 'lucide-react'

type JurnalProgressTrackerProps = {
  submittedBy?: string | null
}

const steps = [
  {
    label: 'Jurnal diajukan',
    description: 'Pengajuan telah masuk ke antrean review.',
    state: 'complete',
  },
  {
    label: 'Menunggu persetujuan',
    description: 'Approver divisi sedang meninjau jurnal.',
    state: 'active',
  },
  {
    label: 'Terbit di ALAS',
    description: 'Jurnal diterbitkan setelah disetujui.',
    state: 'pending',
  },
] as const

export function JurnalProgressTracker({ submittedBy }: JurnalProgressTrackerProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5" aria-label="Progress tracker jurnal">
      <h2 className="text-sm font-semibold text-white/85">Progress tracker</h2>
      <ol className="mt-5 space-y-4">
        {steps.map((step, index) => {
          const isComplete = step.state === 'complete'
          const isActive = step.state === 'active'

          return (
            <li key={step.label} className="relative flex gap-3">
              {index < steps.length - 1 ? <span className={`absolute left-[11px] top-6 h-8 w-px ${isComplete ? 'bg-emerald-400/70' : 'bg-white/10'}`} aria-hidden="true" /> : null}
              <span className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isComplete ? 'bg-emerald-400 text-black' : isActive ? 'bg-[#FF8A6C] text-black ring-4 ring-[#FF8A6C]/15' : 'bg-white/10 text-white/45'}`}>
                {isComplete ? <Check className="h-3.5 w-3.5" /> : isActive ? <Clock3 className="h-3.5 w-3.5" /> : <Circle className="h-2.5 w-2.5" />}
              </span>
              <div className="min-w-0 pb-1">
                <p className={`text-sm font-medium ${isComplete ? 'text-emerald-300' : isActive ? 'text-[#FFB09D]' : 'text-white/50'}`}>{step.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/50">{index === 0 && submittedBy ? `Diajukan oleh ${submittedBy}.` : step.description}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
