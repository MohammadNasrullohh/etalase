'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Calendar } from 'lucide-react'

interface LeaderProfileModalProps {
  id: string | null
  isOpen: boolean
  onClose: () => void
}

export const LeaderProfileModal: React.FC<LeaderProfileModalProps> = ({ id, isOpen, onClose }) => {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['pimpinan-detail', id],
    queryFn: () => {
      if (!id) return null
      return fetch(`/api/pimpinan/${id}`).then(r => {
        if (!r.ok) throw new Error('Failed to fetch detail')
        return r.json()
      })
    },
    enabled: isOpen && !!id,
  })

  if (!isOpen) return null

  const p = response?.data

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`
      }
      return dateStr
    } catch {
      return dateStr
    }
  }

  const formatPeriode = (start: string, end?: string | null) => {
    return `${formatDate(start)} — ${end ? formatDate(end) : 'Sekarang'}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container — dark glass theme */}
      <div
        className="relative w-full max-w-lg rounded-xl shadow-2xl z-10 overflow-hidden animate-scale-in glass-surface-strong"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full transition-colors z-20"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        >
          <X className="w-4 h-4" />
        </button>

        {isLoading ? (
          <div className="py-16 text-center text-white/30 font-mono text-sm">Memuat profil...</div>
        ) : error || !p ? (
          <div className="py-16 text-center text-red-400 font-mono text-sm">
            {error ? (error as Error).message : 'Data tidak ditemukan'}
          </div>
        ) : (
          <div>
            {/* Header Photo Panel */}
            <div className="relative w-full h-56 bg-black overflow-hidden">
              {p.foto_url ? (
                <img
                  src={p.foto_url}
                  alt={p.nama}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center font-mono text-sm uppercase tracking-widest"
                  style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.2)' }}
                >
                  {p.jabatan}
                </div>
              )}
              {/* Dark gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--color-ink)] to-transparent pointer-events-none" />
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 pt-2">
              <span
                className="inline-block px-2.5 py-0.5 text-[9px] font-mono font-semibold rounded mb-2 uppercase tracking-widest"
                style={{
                  background: 'rgba(var(--color-ember-bright-rgb), 0.15)',
                  color: 'var(--color-ember-bright)',
                  border: '1px solid rgba(var(--color-ember-bright-rgb), 0.3)',
                }}
              >
                {p.jabatan}
              </span>
              <h2 className="text-xl md:text-2xl font-bold leading-tight mb-2 pr-8 text-white">
                {p.nama}
              </h2>

              <div className="flex items-center gap-1.5 font-mono text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--color-ember-bright)' }} />
                <span>{formatPeriode(p.periode_mulai, p.periode_selesai)}</span>
              </div>

              {/* Divider */}
              <div className="border-t mb-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* Bio */}
              {p.bio ? (
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Biografi Singkat:
                  </h4>
                  <p className="text-sm leading-relaxed font-sans whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {p.bio}
                  </p>
                </div>
              ) : (
                <div className="text-xs font-mono italic" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Biografi singkat belum ditambahkan.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default LeaderProfileModal
