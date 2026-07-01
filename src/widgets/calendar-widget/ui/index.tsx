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

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const paddingCells = Array(firstDay).fill(null)
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const getFullDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isHighlighted = (day: number) => {
    return activeDays.includes(day)
  }

  const isActive = (day: number) => {
    if (!activeDate) return false
    const dStr = getFullDateString(day)
    return activeDate === dStr
  }

  return (
    <div className="calendar-widget animate-slide-right p-5 bg-[#0F0F14] text-white border border-white/8 rounded-xl shadow-2xl backdrop-blur-sm" style={{ animationDelay: '250ms' }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-neutral-400">
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={handlePrevMonth}
            className="p-1 rounded border border-white/10 hover:border-white/25 hover:bg-white/8 text-neutral-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-1 rounded border border-white/10 hover:border-white/25 hover:bg-white/8 text-neutral-400 hover:text-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-neutral-500 uppercase mb-2">
        <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-mono text-sm">
        {paddingCells.map((_, idx) => (
          <div key={`pad-${idx}`} className="py-2 opacity-0" />
        ))}
        {dayCells.map((day) => {
          const highlighted = isHighlighted(day)
          const currentActive = isActive(day)
          
          return (
            <div 
              key={`day-${day}`}
              onClick={() => {
                if (highlighted) {
                  const dStr = getFullDateString(day)
                  onDateClick(dStr)
                }
              }}
              className={`relative py-2 rounded transition-all duration-200 select-none ${
                currentActive
                  ? 'bg-[#F2613F] text-white font-bold scale-110 shadow-[0_0_12px_rgba(242,97,63,0.5)]'
                  : highlighted
                    ? 'text-white font-semibold hover:bg-white/8 hover:text-[#F2613F] cursor-pointer'
                    : 'text-neutral-700 cursor-default'
              }`}
              id={`calendar-day-${getFullDateString(day)}`}
            >
              {day}
              {highlighted && !currentActive && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#F2613F] opacity-70" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default CalendarWidget
