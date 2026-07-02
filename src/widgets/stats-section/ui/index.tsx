'use client'

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
import { BarChart } from './bar-chart'

interface StatsData {
  years: number[]
  year: number
  stats: Record<string, number>
}

const CATEGORY_COLORS: Record<string, string> = {
  mou:       '#7C3AED',
  audiensi:  '#0EA5E9',
  pelaporan: '#F59E0B',
  sengketa:  '#EF4444',
  lainnya:   '#6B7280',
}

const CATEGORY_LABELS: Record<string, string> = {
  mou:       'MoU',
  audiensi:  'Audiensi',
  pelaporan: 'Pelaporan',
  sengketa:  'Sengketa',
  lainnya:   'Lainnya',
}

const ALL_CATEGORIES = ['mou', 'audiensi', 'pelaporan', 'sengketa', 'lainnya']

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

  // IntersectionObserver — aktifkan chart saat 30% section masuk viewport
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

  const chartData = useMemo(() => ALL_CATEGORIES.map(k => ({
    kategori: k,
    total: data?.stats?.[k] ?? 0,
  })).filter(d => d.total > 0 || (data?.stats && Object.keys(data.stats).length > 0)),
  [data?.stats])

  const totalKegiatan = useMemo(
    () => chartData.reduce((acc, d) => acc + d.total, 0),
    [chartData]
  )

  return (
    <section
      id="section-stats"
      ref={sectionRef}
      className="relative w-full bg-[#08080C] lg:h-screen lg:overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 right-[-10%] w-[50vw] h-[50vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-0 left-[-5%] w-[40vw] h-[40vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-8 lg:h-full flex flex-col">

        {/* ── Section header ── */}
        <div className="flex-shrink-0 mb-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/25 mb-1">
            Bawaslu Kebumen
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold text-white"
            style={{ fontFamily: 'Roboto, sans-serif', letterSpacing: '0.05em' }}
          >
            Rekapitulasi Kegiatan
          </h2>
        </div>

        {/* ── Main content grid ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0 pb-4">

          {/* Chart area — glass panel */}
          <div
            className="col-span-1 lg:col-span-3 relative min-h-[280px] lg:min-h-0 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              padding: '16px',
            }}
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-6 rounded-full animate-pulse"
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        animationDelay: `${i * 150}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <BarChart data={chartData} isVisible={isSectionVisible} />
            )}
          </div>

          {/* Legend + summary — glass panel, right side */}
          <div
            className="col-span-1 lg:col-span-2 flex flex-col justify-center gap-5 rounded-2xl py-6 px-5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
            }}
          >
            {/* Total count */}
            <div className="flex items-baseline gap-3">
              <span
                className="text-4xl sm:text-5xl font-bold text-white"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {totalKegiatan}
              </span>
              <span className="text-sm text-white/35 font-mono leading-snug">
                kegiatan<br />tercatat
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

            {/* Category legend */}
            <div className="flex flex-col gap-3">
              {ALL_CATEGORIES.map(k => {
                const val = data?.stats?.[k] ?? 0
                const pct = totalKegiatan > 0 ? Math.round((val / totalKegiatan) * 100) : 0
                return (
                  <div key={k} className="flex items-center gap-3">
                    <span
                      className="flex-shrink-0 w-2 h-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[k] }}
                    />
                    <span className="text-xs text-white/50 font-mono w-20 flex-shrink-0">
                      {CATEGORY_LABELS[k]}
                    </span>
                    {/* Glass progress track */}
                    <div
                      className="flex-1 rounded-full overflow-hidden"
                      style={{
                        height: '4px',
                        background: 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: CATEGORY_COLORS[k],
                          boxShadow: `0 0 6px ${CATEGORY_COLORS[k]}55`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-white/35 font-mono w-6 text-right flex-shrink-0">
                      {val}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Year selector — glass pill row ── */}
        <div
          className="flex-shrink-0 flex items-center gap-2 sm:gap-3 pt-4 pb-1 overflow-x-auto no-scrollbar"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/20 flex-shrink-0 mr-2">
            Tahun
          </span>
          {(data?.years ?? []).map(year => {
            const isSelected = year === selectedYear
            return (
              <button
                key={year}
                onClick={() => handleYearClick(year)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-mono font-medium transition-all duration-200"
                style={{
                  background: isSelected
                    ? 'rgba(124,58,237,0.20)'
                    : 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.30)',
                  border: isSelected
                    ? '1px solid rgba(124,58,237,0.55)'
                    : '1px solid rgba(255,255,255,0.07)',
                  fontWeight: isSelected ? 700 : 400,
                  fontSize: isSelected ? '1rem' : '0.875rem',
                  letterSpacing: '0.08em',
                  boxShadow: isSelected
                    ? '0 0 16px rgba(124,58,237,0.20), inset 0 1px 0 rgba(255,255,255,0.08)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.04)',
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
export default StatsSection
