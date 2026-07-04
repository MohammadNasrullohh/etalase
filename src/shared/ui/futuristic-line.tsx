'use client'

import React, { useState, useEffect, useRef } from 'react'

interface FuturisticLineProps {
  activeId: string | null
  activeDate: string | null
}

/**
 * SVG overlay dengan `position: fixed` di root viewport.
 * Koordinat dihitung via getBoundingClientRect() relatif ke viewport,
 * sehingga bisa menghubungkan elemen di dua scroll container berbeda.
 */
export const FuturisticLine: React.FC<FuturisticLineProps> = ({ activeId, activeDate }) => {
  const [lineCoords, setLineCoords] = useState<{
    x1: number; y1: number
    x2: number; y2: number
    animKey: number    // berubah setiap kali activeId ganti → animasi restart
  } | null>(null)

  const animKeyRef = useRef(0)

  useEffect(() => {
    // Setiap kali activeId berubah, naikkan animKey agar animasi restart
    animKeyRef.current += 1
    const currentAnimKey = animKeyRef.current

    const updateLine = () => {
      if (!activeId || !activeDate) {
        setLineCoords(null)
        return
      }

      const cardDot = document.getElementById(`jurnal-card-dot-${activeId}`)
      const calendarDay = document.getElementById(`calendar-day-${activeDate}`)

      if (!cardDot || !calendarDay) {
        setLineCoords(null)
        return
      }

      const dotRect = cardDot.getBoundingClientRect()
      const dayRect = calendarDay.getBoundingClientRect()

      setLineCoords({
        x1: dotRect.left + dotRect.width / 2,
        y1: dotRect.top + dotRect.height / 2,
        // Endpoint: tepi KIRI kotak tanggal (bukan tengah)
        x2: dayRect.left,
        y2: dayRect.top + dayRect.height / 2,
        animKey: currentAnimKey,
      })
    }

    updateLine()

    window.addEventListener('resize', updateLine, { passive: true })
    window.addEventListener('scroll', updateLine, { passive: true })

    // Polling ringan untuk scroll internal list
    const interval = setInterval(updateLine, 150)

    return () => {
      window.removeEventListener('resize', updateLine)
      window.removeEventListener('scroll', updateLine)
      clearInterval(interval)
    }
  }, [activeId, activeDate])

  if (!lineCoords) return null

  const { x1, y1, x2, y2, animKey } = lineCoords

  // Bezier: keluar horizontal dari card, belok ke tanggal kalender
  const midX = x1 + (x2 - x1) * 0.65
  const pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`

  // Panjang approx untuk dasharray
  const dx = x2 - x1, dy = y2 - y1
  const length = Math.hypot(dx, dy) * 1.4

  // Nama animasi unik per render agar selalu restart
  const animName = `fl-draw-${animKey}`

  return (
    <svg
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 60,
        overflow: 'visible',
      }}
    >
      <defs>
        <linearGradient id="fl-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-ember-bright)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-ember-bright)" stopOpacity="0.3" />
        </linearGradient>
        <filter id="fl-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Keyframe unik per animKey agar selalu re-trigger */}
        <style>{`
          @keyframes ${animName} {
            from { stroke-dashoffset: ${length}; }
            to   { stroke-dashoffset: 0; }
          }
        `}</style>
      </defs>

      {/* Garis bezier */}
      <path
        d={pathD}
        fill="none"
        stroke="url(#fl-gradient)"
        strokeWidth="1.5"
        filter="url(#fl-glow)"
        strokeDasharray={length}
        strokeDashoffset={0}
        style={{
          animation: `${animName} 480ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
        }}
      />

      {/* Titik awal — kanan card */}
      <circle cx={x1} cy={y1} r="3.5" fill="var(--color-ember-bright)" filter="url(#fl-glow)" />

      {/* Titik akhir — tepi kiri kotak tanggal */}
      <circle
        cx={x2}
        cy={y2}
        r="3.5"
        fill="none"
        stroke="var(--color-ember-bright)"
        strokeWidth="1.5"
        filter="url(#fl-glow)"
      />
      <circle cx={x2} cy={y2} r="1.8" fill="var(--color-ember-bright)" />
    </svg>
  )
}

export default FuturisticLine
