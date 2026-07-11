'use client'

import { Calendar, FileText, CheckCircle2, Clock } from 'lucide-react'
import { MyJurnalItem } from '../api/get-my-jurnals.action'

function getKategoriLabel(val: string) {
  const map: Record<string, string> = {
    mou: 'MoU & Kerjasama',
    koordinasi: 'Koordinasi',
    sosialisasi: 'Sosialisasi',
    pembinaan: 'Pembinaan',
    pengawasan: 'Pengawasan',
    rapat: 'Rapat Internal',
    sengketa: 'Sengketa',
    pelaporan: 'Pelaporan',
    lainnya: 'Lain-lain'
  }
  return map[val] || val
}

export function MyJurnalCard({ item }: { item: MyJurnalItem }) {
  const isDraft = item.status === 'draft'

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:bg-slate-800/50 transition-colors group relative overflow-hidden flex flex-col h-full">
      
      {/* Decorative gradient blur */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-20 pointer-events-none ${
        isDraft ? 'bg-amber-500' : 'bg-emerald-500'
      }`} />

      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          <FileText className="w-3.5 h-3.5 mr-1.5 opacity-70" />
          {getKategoriLabel(item.kategori)}
        </span>
        
        {/* Progress Tracker Badge */}
        {isDraft ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Menunggu Approval
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Terbit Publik
          </span>
        )}
      </div>

      <h3 className="text-base font-semibold text-white mb-3 line-clamp-2 leading-snug flex-1">
        {item.judul}
      </h3>

      <div className="flex items-center text-sm text-slate-400 mt-auto pt-4 border-t border-slate-800/60">
        <Calendar className="w-4 h-4 mr-2 opacity-70" />
        {new Date(item.tanggal_kegiatan).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
      </div>
    </div>
  )
}
