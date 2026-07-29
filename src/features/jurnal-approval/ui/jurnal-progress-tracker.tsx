import { Check, Circle, Clock3, Zap } from 'lucide-react'
import { SiteTitle } from '@/entities/site-settings/ui/site-title.client'

type JurnalProgressTrackerProps = {
  submittedBy?: string | null
  submittedAt?: string | null
}

const steps = [
  {
    id: 'submitted',
    label: 'Jurnal diajukan',
    description: 'Pengajuan telah masuk ke antrean review.',
    state: 'complete',
  },
  {
    id: 'review',
    label: 'Menunggu persetujuan',
    description: 'Menunggu review approver divisi.',
    state: 'active',
  },
  {
    id: 'published',
    label: 'Terbit',
    description: 'Jurnal diterbitkan setelah disetujui.',
    state: 'pending',
  },
] as const

function formatTimestamp(value?: string | null) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function JurnalProgressTracker({ submittedBy, submittedAt }: JurnalProgressTrackerProps) {
  const submittedTimestamp = formatTimestamp(submittedAt)

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5" aria-label="Progress tracker jurnal">
      <h2 className="text-sm font-semibold text-white/85">Progress tracker</h2>
      <ol className="mt-5 space-y-4" aria-live="polite">
        {steps.map((step, index) => {
          const isComplete = step.state === 'complete'
          const isActive = step.state === 'active'

          return (
            <li key={step.id} className="flex gap-3">
              <div className="flex w-7 shrink-0 flex-col items-center">
                <span className="relative flex h-7 w-7 items-center justify-center" aria-hidden="true">
                  {isActive ? <span className="absolute inset-0 rounded-full bg-[var(--color-accent-hover)]/25 animate-ping motion-reduce:animate-none" /> : null}
                  <span className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full ${isComplete ? 'bg-emerald-400 text-black' : isActive ? 'bg-[var(--color-accent-hover)] text-black' : 'bg-white/10 text-white/45'}`}>
                    {isComplete ? <Check className="h-3 w-3" /> : isActive ? <Zap className="h-3 w-3" /> : <Circle className="h-2.5 w-2.5" />}
                  </span>
                </span>
                {index < steps.length - 1 ? <span className={`mt-1 h-9 w-0.5 ${isComplete ? 'bg-emerald-400/70' : 'bg-white/10'}`} aria-hidden="true" /> : null}
              </div>

              <div className={`min-w-0 flex-1 pb-2 ${isActive ? 'rounded-xl border border-[var(--color-accent-hover)]/25 bg-[var(--color-accent-hover)]/10 px-3 py-2.5' : ''}`}>
                <p className={`text-sm font-medium ${isComplete ? 'text-emerald-300' : isActive ? 'text-[var(--color-accent-active-text)]' : 'text-white/50'}`}>
                  {step.id === 'published' ? <>Terbit di <SiteTitle /></> : step.label}
                  {isActive ? <span className="ml-1.5 text-[10px] font-mono text-[var(--color-accent-active-text)]/75 animate-pulse motion-reduce:animate-none">sedang diproses...</span> : null}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">{step.description}</p>

                {step.id === 'submitted' && (submittedBy || submittedTimestamp) ? (
                  <div className="mt-2 space-y-0.5 text-xs">
                    {submittedBy ? <p className="flex items-center gap-1.5 text-white/70"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />{submittedBy}</p> : null}
                    {submittedTimestamp ? <p className="pl-3 text-white/45">{submittedTimestamp}</p> : null}
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
