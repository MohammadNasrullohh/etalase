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
    if (activeDate) {
      const d = new Date(activeDate)
      if (d.getMonth() !== currentDate.getMonth() || d.getFullYear() !== currentDate.getFullYear()) {
        setCurrentDate(d)
      }
    }
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
      className="calendar-widget animate-slide-right rounded-2xl"
      style={{
        animationDelay: '250ms',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 32px rgba(0,0,0,0.25)',
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
            className="transition-all duration-200"
            style={{
              padding: '4px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.45)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(255,255,255,0.10)'
              el.style.borderColor = 'rgba(255,255,255,0.18)'
              el.style.color = '#ffffff'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(255,255,255,0.05)'
              el.style.borderColor = 'rgba(255,255,255,0.08)'
              el.style.color = 'rgba(255,255,255,0.45)'
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {/* Next button */}
          <button
            onClick={handleNextMonth}
            className="transition-all duration-200"
            style={{
              padding: '4px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.45)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(255,255,255,0.10)'
              el.style.borderColor = 'rgba(255,255,255,0.18)'
              el.style.color = '#ffffff'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              el.style.background = 'rgba(255,255,255,0.05)'
              el.style.borderColor = 'rgba(255,255,255,0.08)'
              el.style.color = 'rgba(255,255,255,0.45)'
            }}
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
              id={`calendar-day-${getFullDateString(day)}`}
              className="relative py-2 rounded-lg select-none transition-all duration-200"
              style={{
                cursor: highlighted ? 'pointer' : 'default',
                color: currentActive
                  ? '#ffffff'
                  : highlighted
                    ? 'rgba(255,255,255,0.85)'
                    : 'rgba(255,255,255,0.18)',
                fontWeight: currentActive || highlighted ? 600 : 400,
                background: currentActive
                  ? '#F2613F'
                  : 'transparent',
                transform: currentActive ? 'scale(1.1)' : 'scale(1)',
                boxShadow: currentActive
                  ? '0 0 14px rgba(242,97,63,0.55)'
                  : 'none',
              }}
              onMouseEnter={e => {
                if (highlighted && !currentActive) {
                  const el = e.currentTarget
                  el.style.background = 'rgba(242,97,63,0.15)'
                  el.style.color = '#F2613F'
                }
              }}
              onMouseLeave={e => {
                if (highlighted && !currentActive) {
                  const el = e.currentTarget
                  el.style.background = 'transparent'
                  el.style.color = 'rgba(255,255,255,0.85)'
                }
              }}
            >
              {day}
              {/* Dot indicator for highlighted days */}
              {highlighted && !currentActive && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: '#F2613F', opacity: 0.7 }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarWidget
