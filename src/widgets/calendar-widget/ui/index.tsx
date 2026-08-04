'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarWidgetProps {
  activeDate: string | null
  onDateClick: (dateStr: string) => void
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ activeDate, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (activeDate) return new Date(activeDate)
    return new Date()
  })

  useEffect(() => {
    if (!activeDate) return

    const nextDate = new Date(activeDate)
    setCurrentDate((displayedDate) => {
      const isSameMonth = nextDate.getMonth() === displayedDate.getMonth()
        && nextDate.getFullYear() === displayedDate.getFullYear()

      return isSameMonth ? displayedDate : nextDate
    })
  }, [activeDate])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`

  const { data: response } = useQuery({
    queryKey: ['calendar', monthStr],
    queryFn: () => fetch(`/api/jurnal/calendar?month=${monthStr}`).then(r => {
      if (!r.ok) throw new Error('Network error')
      return r.json()
    }),
  })

  const activeDays: number[] = response?.data?.dates || []

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay()

  const daysInMonth   = getDaysInMonth(year, month)
  const firstDay      = getFirstDayOfMonth(year, month)
  const paddingCells  = Array(firstDay).fill(null)
  const dayCells      = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const getFullDateString = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const isHighlighted = (day: number) => activeDays.includes(day)
  const isActive = (day: number) => !!activeDate && activeDate === getFullDateString(day)

  return (
    <div
      className="calendar-widget animate-slide-right glass-card"
      style={{
        animationDelay: '250ms',
        padding: '20px',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-mono uppercase tracking-widest text-white/50">
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-1.5">
          {/* Prev button */}
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg bg-white/5 border border-white/10 text-white/45 hover:bg-white/10 hover:border-white/20 hover:text-white focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {/* Next button */}
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg bg-white/5 border border-white/10 text-white/45 hover:bg-white/10 hover:border-white/20 hover:text-white focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-white/30 uppercase mb-2 tracking-widest">
        <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-sm">
        {paddingCells.map((_, idx) => (
          <div key={`pad-${idx}`} className="py-2 opacity-0" />
        ))}
        {dayCells.map((day) => {
          const highlighted  = isHighlighted(day)
          const currentActive = isActive(day)

          return (
            <div
              key={`day-${day}`}
              onClick={() => {
                if (highlighted) onDateClick(getFullDateString(day))
              }}
              onKeyDown={(e) => {
                if (highlighted && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onDateClick(getFullDateString(day))
                }
              }}
              tabIndex={highlighted ? 0 : -1}
              role={highlighted ? 'button' : undefined}
              id={`calendar-day-${getFullDateString(day)}`}
              className={`relative py-2 rounded-lg select-none transition-all duration-200 ${
                highlighted ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ember-bright)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-canvas)]' : 'cursor-default'
              } ${
                highlighted && !currentActive ? 'hover:bg-[rgba(var(--color-ember-bright-rgb),0.15)] hover:text-[var(--color-ember-bright)]' : ''
              }`}
              style={{
                color: currentActive
                  ? 'var(--color-text-primary)'
                  : highlighted
                    ? 'rgba(255,255,255,0.85)'
                    : 'rgba(255,255,255,0.18)',
                fontWeight: currentActive || highlighted ? 600 : 400,
                background: currentActive
                  ? 'var(--color-ember-bright)'
                  : 'transparent',
                transform: currentActive ? 'scale(1.1)' : 'scale(1)',
                boxShadow: currentActive
                  ? '0 0 14px rgba(var(--color-ember-bright-rgb), 0.55)'
                  : 'none',
              }}
            >
              {day}
              {/* Dot indicator for highlighted days */}
              {highlighted && !currentActive && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: 'var(--color-ember-bright)', opacity: 0.7 }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

