import { Folder, AlertCircle } from 'lucide-react'
import { getMyJurnalsAction } from '@/features/jurnal-saya/api/get-my-jurnals.action'
import { MyJurnalCard } from '@/features/jurnal-saya/ui/my-jurnal-card.client'

export const dynamic = 'force-dynamic'

export default async function JurnalSayaPage() {
  let jurnals = []
  let error = null

  try {
    jurnals = await getMyJurnalsAction()
  } catch (err: any) {
    error = err.message || 'Gagal memuat data jurnal'
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white font-mono uppercase tracking-widest mb-2 flex items-center">
          <Folder className="w-6 h-6 mr-3 text-blue-400" />
          Jurnal Saya
        </h1>
        <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
          Lacak seluruh riwayat pengajuan jurnal Anda di sini. Jurnal dengan status <strong className="text-amber-400 font-medium">Menunggu Approval</strong> sedang dalam antrean moderasi, sedangkan jurnal dengan status <strong className="text-emerald-400 font-medium">Terbit Publik</strong> sudah dapat diakses oleh masyarakat luas.
        </p>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <h3 className="text-red-400 font-semibold mb-1">Gagal Memuat Jurnal</h3>
          <p className="text-red-400/80 text-sm">{error}</p>
        </div>
      ) : jurnals.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
            <Folder className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-semibold mb-2">Belum ada Jurnal</h3>
          <p className="text-slate-400 text-sm max-w-sm">
            Anda belum memiliki riwayat pengajuan jurnal. Jurnal yang Anda buat akan muncul di halaman ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jurnals.map((j) => (
            <MyJurnalCard key={`${j.id}-${j.status}`} item={j} />
          ))}
        </div>
      )}
    </div>
  )
}
