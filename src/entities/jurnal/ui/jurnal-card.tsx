import React from 'react'

interface JurnalCardProps {
  id: string
  judul: string
  tanggal_kegiatan: string
  kategori: string
  thumbnail_url?: string | null
  pihak_terkait?: any[]
  isActive?: boolean
  isLineTarget?: boolean  // card ini yang sedang dituju oleh FuturisticLine
  onClick?: () => void
  onHover?: (id: string, date: string) => void
  onLeaveHover?: () => void
  staggerDelay?: string
}

const categoryLabels: Record<string, string> = {
  mou: 'MoU',
  sengketa: 'Sengketa',
  audiensi: 'Audiensi',
  pelaporan: 'Pelaporan',
  lainnya: 'Lainnya'
}

const categoryStyles: Record<string, string> = {
  mou: 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-400 border border-blue-500/20',
  sengketa: 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 border border-purple-500/20',
  audiensi: 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 border border-emerald-500/20',
  pelaporan: 'bg-gradient-to-r from-rose-500/10 to-red-500/10 text-rose-400 border border-rose-500/20',
  lainnya: 'bg-gradient-to-r from-neutral-500/10 to-neutral-600/10 text-neutral-400 border border-neutral-500/20',
}

const categoryBorders: Record<string, string> = {
  mou: 'border-l-blue-500',
  sengketa: 'border-l-purple-500',
  audiensi: 'border-l-emerald-500',
  pelaporan: 'border-l-rose-500',
  lainnya: 'border-l-neutral-500',
}

export const JurnalCard: React.FC<JurnalCardProps> = ({
  id,
  judul,
  tanggal_kegiatan,
  kategori,
  thumbnail_url,
  pihak_terkait = [],
  isActive = false,
  isLineTarget = false,
  onClick,
  onHover,
  onLeaveHover,
  staggerDelay = '0ms'
}) => {
  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        const day = parseInt(parts[2], 10)
        const month = months[parseInt(parts[1], 10) - 1]
        const year = parts[0]
        return `${day} ${month} ${year}`
      }
      return dateStr
    } catch {
      return dateStr
    }
  }

  const pihakNames = pihak_terkait.map(p => p.nama).join(', ')
  const borderClass = categoryBorders[kategori] || categoryBorders.lainnya
  const tagClass = categoryStyles[kategori] || categoryStyles.lainnya

  return (
    <div
      id={`jurnal-card-${id}`}
      data-tanggal={tanggal_kegiatan}
      className={`group jurnal-card relative p-6 mb-6 transition-all duration-300 cursor-pointer animate-slide-left border border-neutral-800/40 border-l-4 rounded-xl bg-[#0f0f15]/30 backdrop-blur-md ${borderClass} ${
        isActive 
          ? 'shadow-[0_0_30px_rgba(242,97,63,0.12)] bg-[#12121a]/80 ring-1 ring-white/10' 
          : 'hover:border-neutral-700/80 hover:-translate-y-1 hover:bg-[#0f0f15]/75 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]'
      }`}
      style={{ animationDelay: staggerDelay }}
      onClick={onClick}
      onMouseEnter={() => onHover?.(id, tanggal_kegiatan)}
      onMouseLeave={() => onLeaveHover?.()}
    >
      <div className="flex justify-between items-center mb-3">
        <span className={`px-2.5 py-0.5 text-xs font-mono font-medium rounded-full ${tagClass}`}>
          {categoryLabels[kategori] || kategori}
        </span>
        <span className="font-mono text-xs text-[var(--color-text-muted)]">
          {formatDate(tanggal_kegiatan)}
        </span>
      </div>

      <div className="flex gap-4">
        {thumbnail_url && (
          <div className="flex-shrink-0 w-20 h-20 overflow-hidden border border-neutral-800/60 rounded-lg">
            <img 
              src={thumbnail_url} 
              alt={judul} 
              className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>
        )}
        <div className="flex-grow">
          <h3 className="text-base font-bold leading-snug mb-1 text-white hover:text-[var(--color-ember-bright)] transition-colors">
            {judul}
          </h3>
          {pihakNames && (
            <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">
              Pihak Terkait: <span className="text-[#E2D7D0]">{pihakNames}</span>
            </p>
          )}
        </div>
      </div>
      
      {/* Right dot — hanya muncul pada card yang dituju line (isLineTarget) atau hover */}
      <div 
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#F2613F] transition-opacity duration-200 pointer-events-none group-hover:opacity-100 ${isLineTarget ? 'opacity-100' : 'opacity-0'}`}
        id={`jurnal-card-dot-${id}`}
      />
    </div>
  )
}
