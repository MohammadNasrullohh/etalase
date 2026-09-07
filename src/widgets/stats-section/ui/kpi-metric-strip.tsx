'use client'

import React from 'react'
import { Calendar, Users, Newspaper, Award } from 'lucide-react'
import { KpiSummary } from '@/entities/jurnal/api/get-jurnal-stats'
import { getCategoryColor, getCategoryLabel } from '@/shared/ui/colors'

interface KpiMetricStripProps {
  kpi: KpiSummary | undefined
  selectedYear: number | null
  onFilterCategory?: (kategori: string) => void
  onViewAll?: () => void
}

export const KpiMetricStrip: React.FC<KpiMetricStripProps> = ({
  kpi,
  selectedYear,
  onFilterCategory,
  onViewAll,
}) => {
  const topCat = kpi?.top_category

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
      {/* 1. Total Kegiatan */}
      <div
        onClick={onViewAll}
        className="glass-card p-3.5 sm:p-4 flex items-center justify-between cursor-pointer group hover:border-[#D6CBB5] transition-all duration-200"
        title="Klik untuk melihat seluruh kegiatan di arsip"
      >
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
            Total Kegiatan
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-hover)] transition-colors">
              {kpi?.total_kegiatan ?? 0}
            </span>
            <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
              {selectedYear ?? ''}
            </span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#FAF7F0] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] group-hover:bg-[#F5B748]/20 transition-all">
          <Calendar className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Kategori Unggulan */}
      <div
        onClick={() => topCat && onFilterCategory?.(topCat.kategori)}
        className="glass-card p-3.5 sm:p-4 flex items-center justify-between cursor-pointer group hover:border-[#D6CBB5] transition-all duration-200"
        title={topCat ? `Klik untuk menyaring kategori ${getCategoryLabel(topCat.kategori)} di arsip` : undefined}
      >
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
            Kategori Terbanyak
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span
              className="text-lg sm:text-xl font-serif font-bold truncate max-w-[120px] sm:max-w-[140px] group-hover:underline"
              style={{ color: topCat ? getCategoryColor(topCat.kategori) : 'var(--color-text-primary)' }}
            >
              {topCat ? getCategoryLabel(topCat.kategori) : '-'}
            </span>
            {topCat && (
              <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                {topCat.percentage}%
              </span>
            )}
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#FAF7F0] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] group-hover:bg-[#F5B748]/20 transition-all">
          <Award className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Mitra Terlibat */}
      <div
        className="glass-card p-3.5 sm:p-4 flex items-center justify-between"
      >
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
            Mitra Kolaborasi
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text-primary)]">
              {kpi?.total_mitra ?? 0}
            </span>
            <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
              instansi
            </span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#FAF7F0] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-muted)]">
          <Users className="w-4 h-4" />
        </div>
      </div>

      {/* 4. Publikasi Media */}
      <div
        className="glass-card p-3.5 sm:p-4 flex items-center justify-between"
      >
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
            Terekspos Berita
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text-primary)]">
              {kpi?.published_media_count ?? 0}
            </span>
            <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
              kegiatan
            </span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#FAF7F0] border border-[var(--color-border-subtle)] flex items-center justify-center text-[var(--color-text-muted)]">
          <Newspaper className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}
