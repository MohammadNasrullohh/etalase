import { PengajuanFormWidget } from '@/widgets/pengajuan-form/ui'

export function PengajuanView() {
  return (
    <div className="min-h-screen bg-[var(--color-base)] py-16 px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-[var(--color-ember-bright)]/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white font-mono tracking-tighter mb-4 uppercase">
            Sistem <span className="text-[var(--color-ember-bright)]">Pengajuan</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Gunakan form di bawah ini untuk mengajukan kegiatan jurnal ke sistem pusat.
          </p>
        </header>

        <PengajuanFormWidget />
      </div>
    </div>
  )
}
