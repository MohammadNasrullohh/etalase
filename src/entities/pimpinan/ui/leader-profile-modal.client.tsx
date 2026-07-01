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
        className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300 animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#F9F4F1] text-neutral-900 rounded-sm shadow-2xl z-10 border border-neutral-200 overflow-hidden animate-scale-in">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-black/40 hover:bg-black/75 text-white hover:scale-105 transition-all z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {isLoading ? (
          <div className="py-16 text-center text-neutral-500 font-mono">Loading profil...</div>
        ) : error || !p ? (
          <div className="py-16 text-center text-red-600 font-mono">Error: {error ? (error as Error).message : 'Not found'}</div>
        ) : (
          <div>
            {/* Header Photo Panel */}
            <div className="relative w-full h-64 bg-neutral-900 overflow-hidden">
              {p.foto_url ? (
                <img 
                  src={p.foto_url} 
                  alt={p.nama} 
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-500 font-mono uppercase">
                  {p.jabatan}
                </div>
              )}
              {/* Fade gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F9F4F1] to-transparent pointer-events-none" />
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 pt-2">
              <span className="inline-block px-2.5 py-0.5 text-[9px] font-mono font-semibold rounded-sm bg-[var(--color-ember-deep)] text-[#F9F4F1] mb-2 uppercase tracking-wider">
                {p.jabatan}
              </span>
              <h2 className="text-xl md:text-2xl font-bold leading-tight mb-2 pr-8 text-neutral-900">
                {p.nama}
              </h2>
              
              <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-500 mb-4">
                <Calendar className="w-3.5 h-3.5 text-[var(--color-ember-mid)]" />
                <span>{formatPeriode(p.periode_mulai, p.periode_selesai)}</span>
              </div>

              {/* Bio */}
              {p.bio ? (
                <div className="mt-4 border-t border-neutral-200 pt-4">
                  <h4 className="text-xs font-mono uppercase text-neutral-400 mb-2">Biografi singkat:</h4>
                  <p className="text-sm text-neutral-700 leading-relaxed font-sans whitespace-pre-wrap">
                    {p.bio}
                  </p>
                </div>
              ) : (
                <div className="mt-4 border-t border-neutral-200 pt-4 text-xs font-mono text-neutral-400 italic">
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
