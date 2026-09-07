'use client'

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
import { BarChart } from './bar-chart'
import { getCategoryColor, getCategoryLabel } from '@/shared/ui/colors'

interface StatsData {
  years: number[]
  year: number
  stats: Record<string, number>
}

const StatsSectionInner: React.FC = () => {
  const [data, setData]                     = useState<StatsData | null>(null)
  const [selectedYear, setSelectedYear]     = useState<number | null>(null)
  const [loading, setLoading]               = useState(true)
  const [isSectionVisible, setIsSectionVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const fetchStats = useCallback(async (year?: number) => {
    setLoading(true)
    try {
      const url = year ? `/api/jurnal/stats?year=${year}` : '/api/jurnal/stats'
      const res  = await fetch(url)
      const json = await res.json()
      if (json.status === 'ok') {
        setData(json)
        setSelectedYear(json.year)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsSectionVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleYearClick = (year: number) => {
    setSelectedYear(year)
    fetchStats(year)
  }

  const categoriesList = useMemo(() => {
    const defaultCats = ['mou', 'audiensi', 'pelaporan', 'sengketa']
    const dbCats = data?.stats ? Object.keys(data.stats) : []
    const combined = Array.from(new Set([...defaultCats, ...dbCats.map(c => c.toLowerCase())]))
    const listWithoutLainnya = combined.filter(c => c !== 'lainnya')
    return [...listWithoutLainnya, 'lainnya']
  }, [data?.stats])

  const chartData = useMemo(() => categoriesList.map(k => ({
    kategori: k,
    total: data?.stats?.[k] ?? 0,
  })).filter(d => d.total > 0 || (data?.stats && Object.keys(data.stats).length > 0)),
  [categoriesList, data?.stats])

  const totalKegiatan = useMemo(
    () => chartData.reduce((acc, d) => acc + d.total, 0),
    [chartData]
  )

  return (
    <section
      id="section-stats"
      ref={sectionRef}
      className="relative w-full bg-[var(--color-canvas)] lg:h-screen lg:overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-8 lg:h-full flex flex-col">

        {/* ── Section header ── */}
        <div className="flex-shrink-0 mb-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--color-text-muted)] mb-1">
            Bawaslu Kebumen
          </p>
          <h2
            className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text-primary)]"
            style={{ letterSpacing: '0.02em' }}
          >
            Rekapitulasi Kegiatan
          </h2>
        </div>

        {/* ── Main content grid ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0 pb-4">

          {/* Chart area */}
          <div
            className="col-span-1 lg:col-span-3 relative min-h-[280px] lg:min-h-0 glass-card p-4"
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-6 rounded-full animate-pulse bg-[var(--color-border-subtle)]"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <BarChart data={chartData} isVisible={isSectionVisible} />
            )}
          </div>

          {/* Legend + summary */}
          <div
            className="col-span-1 lg:col-span-2 flex flex-col justify-center gap-5 glass-card py-6 px-5"
          >
            {/* Total count */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-serif font-bold text-[var(--color-text-primary)]">
                {totalKegiatan}
              </span>
              <span className="text-sm text-[var(--color-text-muted)] font-mono leading-snug">
                kegiatan<br />tercatat
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--color-border-subtle)' }} />

            {/* Category legend */}
            <div className="flex flex-col gap-3">
              {categoriesList.map(k => {
                const val = data?.stats?.[k] ?? 0
                const isDefault = ['mou', 'audiensi', 'pelaporan', 'sengketa', 'lainnya'].includes(k)
                if (!isDefault && val === 0) return null
                const pct = totalKegiatan > 0 ? Math.round((val / totalKegiatan) * 100) : 0
                return (
                  <div key={k} className="flex items-center gap-3">
                    <span
                      className="flex-shrink-0 w-2 h-2 rounded-full"
                      style={{ backgroundColor: getCategoryColor(k) }}
                    />
                    <span className="text-xs text-[var(--color-text-secondary)] font-mono w-20 flex-shrink-0">
                      {getCategoryLabel(k)}
                    </span>
                    {/* Progress track */}
                    <div
                      className="flex-1 rounded-full overflow-hidden bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)]"
                      style={{ height: '8px' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: 'var(--color-accent-emerald)',
                        }}
                      />
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)] font-mono w-6 text-right flex-shrink-0">
                      {val}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Year selector ── */}
        <div
          className="flex-shrink-0 flex items-center gap-2 sm:gap-3 pt-4 pb-1 overflow-x-auto no-scrollbar border-t border-[var(--color-border-subtle)]"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)] flex-shrink-0 mr-2">
            Tahun
          </span>
          {(data?.years ?? []).map(year => {
            const isSelected = year === selectedYear
            return (
              <button
                key={year}
                onClick={() => handleYearClick(year)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-mono font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-focus)]"
                style={{
                  background: isSelected ? 'var(--color-accent-focus)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  border: isSelected ? '1px solid var(--color-ember-bright)' : '1px solid var(--color-border-subtle)',
                  fontWeight: isSelected ? 700 : 400,
                  fontSize: isSelected ? '1rem' : '0.875rem',
                  letterSpacing: '0.08em',
                  boxShadow: isSelected ? '0 2px 8px rgba(245, 183, 72, 0.3)' : 'none',
                }}
              >
                {year}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export const StatsSection = memo(StatsSectionInner)
