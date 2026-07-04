'use client'

import React from 'react'

interface LeaderCardProps {
  id: string
  nama: string
  jabatan: string
  foto_url?: string | null
  onClick?: () => void
  staggerDelay?: string
}

export const LeaderCard: React.FC<LeaderCardProps> = ({
  nama,
  jabatan,
  foto_url,
  onClick,
  staggerDelay = '0ms'
}) => {
  return (
    <div 
      className="group relative flex flex-col items-center cursor-pointer animate-slide-right"
      style={{ animationDelay: staggerDelay }}
      onClick={onClick}
    >
      {/* 3x4 Parallelogram Card */}
      <div 
        className="leader-card relative w-[90px] h-[120px] bg-neutral-900 border border-[var(--color-leader-outline)] overflow-hidden transition-all duration-200 shadow-md group-hover:-translate-y-2 group-hover:shadow-[0_8px_24px_rgba(var(--color-ember-bright-rgb),0.25)]"
        style={{
          transform: 'skewX(var(--card-skew))',
        }}
      >
        {/* Inner Wrapper (Unskewed to render image normally) */}
        <div 
          className="w-full h-full"
          style={{
            transform: 'skewX(calc(-1 * var(--card-skew))) scale(1.2)',
          }}
        >
          {foto_url ? (
            <img 
              src={foto_url} 
              alt={nama} 
              className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
            />
          ) : (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center p-2 text-center text-[9px] font-mono text-[var(--color-text-muted)] uppercase">
              {jabatan}
            </div>
          )}
        </div>
      </div>

      {/* Name reveal behind card on hover */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 text-center whitespace-nowrap z-10 pointer-events-none">
        <div className="font-bold text-xs text-white truncate max-w-[120px]">{nama}</div>
        <div className="text-[9px] font-mono uppercase text-[var(--color-text-muted)]">{jabatan}</div>
      </div>
    </div>
  )
}
export default LeaderCard
