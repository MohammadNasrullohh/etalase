'use client'

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, BarChartItem } from './bar-chart'
import { TrendChart } from './trend-chart'
import { KpiMetricStrip } from './kpi-metric-strip'
import { ActivityPanel } from './activity-panel'
import {
  MonthlyTrendItem,
  ActivityHighlight,
  KpiSummary,
} from '@/entities/jurnal/api/get-jurnal-stats'
import { getCategoryLabel } from '@/shared/ui/colors'
import { TrendingUp, PieChart, Layers } from 'lucide-react'

interface StatsData {
  years: number[]
  year: number
  stats: Record<string, number>
  monthly_trend?: MonthlyTrendItem[]
  division_stats?: Record<string, number>
  kpi_summary?: KpiSummary
  recent_highlights?: ActivityHighlight[]
}

type ChartMode = 'trend' | 'kategori' | 'divisi'

interface ActiveFilter {
  type: 'kategori' | 'bulan' | 'divisi'
  value: string | number
  label: string
  count?: number
}

const StatsSectionInner: React.FC = () => {
  const router = useRouter()
  const [data, setData] = useState<StatsData | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSectionVisible, setIsSectionVisible] = useState(false)
  const [chartMode, setChartMode] = useState<ChartMode>('trend')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const fetchStats = useCallback(async (year?: number) => {
    setLoading(true)
    try {
      const url = year ? `/api/jurnal/stats?year=${year}` : '/api/jurnal/stats'
      const res = await fetch(url)
      const json = await res.json()
      if (json.status === 'ok') {
        setData(json)
        setSelectedYear(json.year)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

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
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleYearClick = (year: number) => {
    setSelectedYear(year)
    setActiveFilter(null)
    fetchStats(year)
  }

  // 1. Kategori Data
  const categoriesList = useMemo(() => {
    const defaultCats = ['mou', 'audiensi', 'pelaporan', 'sengketa']
    const dbCats = data?.stats ? Object.keys(data.stats) : []
    const combined = Array.from(new Set([...defaultCats, ...dbCats.map(c => c.toLowerCase())]))
    const listWithoutLainnya = combined.filter(c => c !== 'lainnya')
    return [...listWithoutLainnya, 'lainnya']
  }, [data?.stats])

  const categoryChartData = useMemo<BarChartItem[]>(() => {
    return categoriesList
      .map(k => ({
        kategori: k,
        label: getCategoryLabel(k),
        total: data?.stats?.[k] ?? 0,
      }))
      .filter(d => d.total > 0 || (data?.stats && Object.keys(data.stats).length > 0))
  }, [categoriesList, data?.stats])

  // 2. Divisi Data
  const divisionChartData = useMemo<BarChartItem[]>(() => {
    if (!data?.division_stats) return []
    return Object.entries(data.division_stats).map(([div, total]) => ({
      kategori: div,
      label: div,
      total,
    }))
  }, [data?.division_stats])

  // 3. Tren Bulanan Data
  const monthlyTrendData = useMemo<MonthlyTrendItem[]>(() => {
    if (data?.monthly_trend && data.monthly_trend.length > 0) {
      return data.monthly_trend
    }
    return Array.from({ length: 12 }, (_, i) => ({ month: i + 1, total: 0 }))
  }, [data?.monthly_trend])

  const totalKegiatan = useMemo(() => {
    if (data?.kpi_summary?.total_kegiatan !== undefined) {
      return data.kpi_summary.total_kegiatan
    }
    return categoryChartData.reduce((acc, d) => acc + d.total, 0)
  }, [data?.kpi_summary, categoryChartData])

  // Filtered highlights for the activity panel
  const displayedHighlights = useMemo(() => {
    const all = data?.recent_highlights ?? []
    if (!activeFilter) return all

    if (activeFilter.type === 'kategori') {
      return all.filter(h => h.kategori.toLowerCase() === String(activeFilter.value).toLowerCase())
    }
    if (activeFilter.type === 'bulan') {
      return all.filter(h => {
        const parts = h.tanggal_kegiatan.split('-')
        return parts.length === 3 && parseInt(parts[1], 10) === activeFilter.value
      })
    }
    return all
  }, [data?.recent_highlights, activeFilter])

  // Handlers for interactions
  const handleBarClick = (item: BarChartItem) => {
    if (chartMode === 'kategori') {
      setActiveFilter({
        type: 'kategori',
        value: item.kategori,
        label: item.label || getCategoryLabel(item.kategori),
        count: item.total,
      })
    } else if (chartMode === 'divisi') {
      setActiveFilter({
        type: 'divisi',
        value: item.kategori,
        label: item.label || item.kategori,
        count: item.total,
      })
    }
  }

  const handleMonthClick = (month: number) => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    const item = monthlyTrendData.find(m => m.month === month)
    setActiveFilter({
      type: 'bulan',
      value: month,
      label: `${monthNames[month - 1]} ${selectedYear ?? ''}`,
      count: item?.total ?? 0,
    })
  }

  const handleSelectActivity = (item: ActivityHighlight) => {
    // Navigate straight to archive with search query for this activity title
    const params = new URLSearchParams()
    params.set('q', item.judul)
    router.replace(`/?${params.toString()}`, { scroll: false })
    document.getElementById('section-arsip')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleViewArchiveWithFilter = (filter: ActiveFilter | null) => {
    const params = new URLSearchParams()
    if (filter) {
      if (filter.type === 'kategori') {
        params.set('kategori', String(filter.value))
      } else if (filter.type === 'bulan') {
        const mm = String(filter.value).padStart(2, '0')
        params.set('date', `${selectedYear ?? 2026}-${mm}`)
      } else if (filter.type === 'divisi') {
        params.set('q', String(filter.value))
      }
    }
    const queryStr = params.toString()
    router.replace(queryStr ? `/?${queryStr}` : '/', { scroll: false })
    document.getElementById('section-arsip')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleKpiFilterCategory = (cat: string) => {
    const params = new URLSearchParams()
    params.set('kategori', cat)
    router.replace(`/?${params.toString()}`, { scroll: false })
    document.getElementById('section-arsip')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleViewAll = () => {
    router.replace('/', { scroll: false })
    document.getElementById('section-arsip')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="section-stats"
      ref={sectionRef}
      className="relative w-full bg-[var(--color-canvas)] py-16 lg:py-20"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col">

        {/* ── Section header & Chart Mode Switcher ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
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

          {/* Chart Mode Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] self-start sm:self-auto">
            <button
              onClick={() => { setChartMode('trend'); setActiveFilter(null) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 ${
                chartMode === 'trend'
                  ? 'bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] font-bold shadow-sm border border-[var(--color-border-subtle)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tren Bulanan</span>
            </button>

            <button
              onClick={() => { setChartMode('kategori'); setActiveFilter(null) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 ${
                chartMode === 'kategori'
                  ? 'bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] font-bold shadow-sm border border-[var(--color-border-subtle)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Kategori</span>
            </button>

            <button
              onClick={() => { setChartMode('divisi'); setActiveFilter(null) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 ${
                chartMode === 'divisi'
                  ? 'bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] font-bold shadow-sm border border-[var(--color-border-subtle)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Divisi</span>
            </button>
          </div>
        </div>

        {/* ── KPI Metric Strip ── */}
        <KpiMetricStrip
          kpi={data?.kpi_summary}
          selectedYear={selectedYear}
          onFilterCategory={handleKpiFilterCategory}
          onViewAll={handleViewAll}
        />

        {/* ── Main content grid: Chart (60%) + Activity Panel (40%) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">

          {/* Left: Chart area */}
          <div className="lg:col-span-3 relative min-h-[320px] glass-card p-4 sm:p-6 flex flex-col justify-center">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-6 rounded-full animate-pulse bg-[var(--color-border-default)]"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : chartMode === 'trend' ? (
              <TrendChart
                data={monthlyTrendData}
                year={selectedYear ?? 2026}
                isVisible={isSectionVisible}
                onMonthClick={handleMonthClick}
              />
            ) : chartMode === 'kategori' ? (
              <BarChart
                data={categoryChartData}
                isVisible={isSectionVisible}
                mode="kategori"
                onBarClick={handleBarClick}
              />
            ) : (
              <BarChart
                data={divisionChartData}
                isVisible={isSectionVisible}
                mode="divisi"
                onBarClick={handleBarClick}
              />
            )}
          </div>

          {/* Right: Activity & Drilldown Panel */}
          <div className="lg:col-span-2 min-h-[320px]">
            <ActivityPanel
              highlights={displayedHighlights}
              selectedYear={selectedYear}
              totalKegiatan={totalKegiatan}
              activeFilter={activeFilter}
              onClearFilter={() => setActiveFilter(null)}
              onSelectActivity={handleSelectActivity}
              onViewArchiveWithFilter={handleViewArchiveWithFilter}
            />
          </div>
        </div>

        {/* ── Year selector ── */}
        <div
          className="flex items-center gap-2 sm:gap-3 pt-5 overflow-x-auto no-scrollbar"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)] flex-shrink-0 mr-2">
            Pilih Tahun:
          </span>
          {(data?.years ?? []).map(year => {
            const isSelected = year === selectedYear
            return (
              <button
                key={year}
                onClick={() => handleYearClick(year)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-mono transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                  isSelected
                    ? 'bg-[var(--color-accent)] text-[#1C1815] font-bold shadow-sm'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]'
                }`}
                style={{
                  letterSpacing: '0.05em',
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
