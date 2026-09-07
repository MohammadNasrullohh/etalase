'use client'

import React from 'react'
import { ActivityHighlight } from '@/entities/jurnal/api/get-jurnal-stats'
import { getCategoryLabel, getCategoryStyle, getCategoryColor } from '@/shared/ui/colors'
import { ExternalLink, ArrowRight, XCircle, Calendar, Sparkles } from 'lucide-react'

interface ActiveFilter {
  type: 'kategori' | 'bulan' | 'divisi'
  value: string | number
  label: string
  count?: number
}

interface ActivityPanelProps {
  highlights: ActivityHighlight[]
  selectedYear: number | null
  totalKegiatan: number
  activeFilter: ActiveFilter | null
  onClearFilter: () => void
  onSelectActivity: (item: ActivityHighlight) => void
  onViewArchiveWithFilter: (filter: ActiveFilter | null) => void
}

function formatDateIndo(dateStr: string): string {
  try {
    const parts = dateStr.split('-')
    if (parts.length !== 3) return dateStr
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ]
    const day = parseInt(parts[2], 10)
    const month = months[parseInt(parts[1], 10) - 1]
    const yr = parts[0]
    return `${day} ${month} ${yr}`
  } catch {
    return dateStr
  }
}

export const ActivityPanel: React.FC<ActivityPanelProps> = ({
  highlights,
  selectedYear,
  totalKegiatan,
  activeFilter,
  onClearFilter,
  onSelectActivity,
  onViewArchiveWithFilter,
}) => {
  return (
    <div className="flex flex-col h-full justify-between glass-card p-4 sm:p-5">
      {/* Header Panel */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {activeFilter ? (
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{
                  backgroundColor:
                    activeFilter.type === 'kategori'
                      ? getCategoryColor(String(activeFilter.value))
                      : '#2D7A4D',
                }}
              />
            ) : (
              <Sparkles className="w-4 h-4 text-[#D99B26]" />
            )}
            <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--color-text-primary)]">
              {activeFilter ? `Filter: ${activeFilter.label}` : 'Sorotan Kegiatan'}
            </h3>
          </div>

          {activeFilter ? (
            <button
              onClick={onClearFilter}
              className="flex items-center gap-1 text-[11px] font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-2 py-0.5 rounded border border-[var(--color-border-subtle)] hover:bg-[#FAF7F0] transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reset
            </button>
          ) : (
            <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
              Tahun {selectedYear ?? ''}
            </span>
          )}
        </div>

        {/* Filter Alert Banner if active */}
        {activeFilter && (
          <div className="mb-3.5 p-3 rounded-lg bg-[#FAF7F0] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] flex items-center justify-between">
            <span className="font-mono">
              Terpilih: <strong>{activeFilter.count ?? 0}</strong> kegiatan
            </span>
            <button
              onClick={() => onViewArchiveWithFilter(activeFilter)}
              className="flex items-center gap-1 text-[#195B8B] font-semibold hover:underline font-mono text-[11px]"
            >
              Lihat di arsip <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* List of Highlight Cards */}
        <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-0.5">
          {highlights.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[var(--color-text-muted)]">
              Belum ada kegiatan tercatat pada periode ini.
            </div>
          ) : (
            highlights.map(item => {
              const catStyle = getCategoryStyle(item.kategori)
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectActivity(item)}
                  className="group relative flex items-start gap-3 p-2.5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-overlay)] hover:border-[#D6CBB5] hover:shadow-sm cursor-pointer transition-all duration-200"
                  title="Klik untuk membuka kegiatan ini di arsip"
                >
                  {/* Thumbnail / Category Icon */}
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.judul}
                      className="w-12 h-12 rounded object-cover flex-shrink-0 border border-[var(--color-border-subtle)]"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded flex-shrink-0 flex items-center justify-center border text-xs font-serif font-bold"
                      style={catStyle}
                    >
                      {item.kategori.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded leading-none"
                        style={catStyle}
                      >
                        {getCategoryLabel(item.kategori)}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)] flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {formatDateIndo(item.tanggal_kegiatan)}
                      </span>
                    </div>

                    <h4 className="text-xs font-serif font-bold text-[var(--color-text-primary)] line-clamp-2 leading-snug group-hover:text-[var(--color-accent-focus)] transition-colors">
                      {item.judul}
                    </h4>

                    {item.link_publikasi && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-[#195B8B] font-mono">
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Rilis Berita</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Footer Navigation Button */}
      <div className="pt-3 mt-3 border-t border-[var(--color-border-subtle)]">
        <button
          onClick={() => onViewArchiveWithFilter(activeFilter)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-subtle)] hover:border-[#D6CBB5] text-xs font-mono font-medium text-[var(--color-text-primary)] hover:bg-[#FAF7F0] transition-all shadow-sm group"
        >
          <span>
            {activeFilter
              ? `Tampilkan ${activeFilter.count ?? 0} Kegiatan ${activeFilter.label} di Arsip`
              : `Jelajahi Seluruh ${totalKegiatan} Kegiatan di Arsip`}
          </span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  )
}
