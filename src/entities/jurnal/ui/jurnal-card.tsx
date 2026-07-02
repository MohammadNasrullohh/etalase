import React from 'react'

interface JurnalCardProps {
  id: string
  judul: string
  tanggal_kegiatan: string
  kategori: string
  thumbnail_url?: string | null
  pihak_terkait?: any[]
  tags?: any[]
  isActive?: boolean
  isLineTarget?: boolean
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

// Kategori badge — glass pill dengan warna accent
const categoryStyles: Record<string, React.CSSProperties> = {
  mou:       { background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' },
  sengketa:  { background: 'rgba(236,72,153,0.10)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.22)' },
  audiensi:  { background: 'rgba(16,185,129,0.10)', color: '#34d399', border: '1px solid rgba(16,185,129,0.22)' },
  pelaporan: { background: 'rgba(245,158,11,0.10)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.22)' },
  lainnya:   { background: 'rgba(107,114,128,0.10)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.20)' },
}

const categoryAccentColor: Record<string, string> = {
  mou:       '#7C3AED',
  sengketa:  '#EC4899',
  audiensi:  '#10B981',
  pelaporan: '#F59E0B',
  lainnya:   '#6B7280',
}

export const JurnalCard: React.FC<JurnalCardProps> = ({
  id,
  judul,
  tanggal_kegiatan,
  kategori,
  thumbnail_url,
  pihak_terkait = [],
  tags = [],
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
  const tagStyle = categoryStyles[kategori] || categoryStyles.lainnya
  const accentColor = categoryAccentColor[kategori] || categoryAccentColor.lainnya

  return (
    <div
      id={`jurnal-card-${id}`}
      data-tanggal={tanggal_kegiatan}
      className="group jurnal-card relative animate-slide-left cursor-pointer mb-4 rounded-2xl transition-all duration-300"
      style={{
        animationDelay: staggerDelay,
        // Glass base — active state sama dengan hover (white-tinted glass)
        background: isActive
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: isActive
          ? `1px solid rgba(255,255,255,0.14)`
          : `1px solid rgba(255,255,255,0.08)`,
        borderLeft: `3px solid ${accentColor}`,
        boxShadow: isActive
          ? `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.09)`
          : `inset 0 1px 0 rgba(255,255,255,0.05)`,
        transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
        padding: '20px 24px',
      }}
      onClick={onClick}
      onMouseEnter={e => {
        if (!isActive) {
          const el = e.currentTarget
          el.style.background = 'rgba(255,255,255,0.07)'
          el.style.borderColor = `rgba(255,255,255,0.14)`
          el.style.transform = 'translateY(-2px)'
          el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)`
        }
        onHover?.(id, tanggal_kegiatan)
      }}
      onMouseLeave={e => {
        if (!isActive) {
          const el = e.currentTarget
          el.style.background = 'rgba(255,255,255,0.04)'
          el.style.borderColor = 'rgba(255,255,255,0.08)'
          el.style.transform = 'translateY(0)'
          el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)'
        }
        onLeaveHover?.()
      }}
    >
      {/* Header row */}
      <div className="flex justify-between items-center mb-3">
        <span
          className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-full"
          style={tagStyle}
        >
          {categoryLabels[kategori] || kategori}
        </span>
        <span className="font-mono text-xs text-[var(--color-text-muted)]">
          {formatDate(tanggal_kegiatan)}
        </span>
      </div>

      {/* Body */}
      <div className="flex gap-4">
        {thumbnail_url && (
          <div
            className="flex-shrink-0 w-20 h-20 overflow-hidden rounded-xl"
            style={{
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            <img
              src={thumbnail_url}
              alt={judul}
              className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
            />
          </div>
        )}
        <div className="flex-grow min-w-0">
          <h3 className="text-base font-bold leading-snug mb-1 text-white group-hover:text-[var(--color-ember-bright)] transition-colors truncate">
            {judul}
          </h3>
          {pihakNames && (
            <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 mb-1">
              Pihak: <span className="text-white/70">{pihakNames}</span>
            </p>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {tags.map((t: string, idx: number) => (
                <span
                  key={idx}
                  className="text-[9px] font-mono"
                  style={{
                    color: 'rgba(255,255,255,0.35)',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right dot — FuturisticLine anchor */}
      <div
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#F2613F] transition-opacity duration-200 pointer-events-none group-hover:opacity-100 ${isLineTarget ? 'opacity-100' : 'opacity-0'}`}
        id={`jurnal-card-dot-${id}`}
      />
    </div>
  )
}
