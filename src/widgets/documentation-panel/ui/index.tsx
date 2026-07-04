'use client'

import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { X, Maximize2 } from 'lucide-react'

interface DocumentationPanelProps {
  activeDate: string | null
}

interface PhotoItem {
  url: string
  caption?: string
  type: string
  jurnalTitle: string
}

export const DocumentationPanel: React.FC<DocumentationPanelProps> = ({ activeDate }) => {
  const queryDate = activeDate || new Date().toISOString().split('T')[0]
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null)

  const { data: response, isLoading } = useQuery({
    queryKey: ['jurnals-by-date', queryDate],
    queryFn: () => fetch(`/api/jurnal?date=${queryDate}`).then(r => {
      if (!r.ok) throw new Error('Network error')
      return r.json()
    }),
    staleTime: 10 * 60 * 1000,
    enabled: !!queryDate,
  })

  const jurnals = response?.data || []
  const photos: PhotoItem[] = jurnals.flatMap((jurnal: any) => {
    const docs = Array.isArray(jurnal.dokumentasi) ? jurnal.dokumentasi : []
    return docs
      .filter((doc: any) => doc && doc.type === 'image')
      .map((doc: any) => ({
        ...doc,
        jurnalTitle: jurnal.judul,
      }))
  })

  const currentKey = photos.map(p => p.url).join(',')
  const [transitioning, setTransitioning]   = useState(false)
  const [displayPhotos, setDisplayPhotos]   = useState<PhotoItem[]>([])
  const [prevKey, setPrevKey]               = useState('')

  useEffect(() => {
    if (currentKey !== prevKey) {
      if (!prevKey) {
        setDisplayPhotos(photos)
        setPrevKey(currentKey)
      } else {
        setTransitioning(true)
        const t = setTimeout(() => {
          setDisplayPhotos(photos)
          setTransitioning(false)
          setPrevKey(currentKey)
        }, 200)
        return () => clearTimeout(t)
      }
    }
  }, [currentKey, photos, prevKey])

  return (
    <div
      className="documentation-panel rounded-2xl mb-6 glass-surface"
      style={{
        padding: '20px 24px',
      }}
    >
      {/* Panel header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-1.5 h-4 rounded-full"
          style={{ background: 'linear-gradient(to bottom, var(--color-ember-bright), rgba(var(--color-ember-bright-rgb), 0.3))' }}
        />
        <h3 className="text-xs font-mono uppercase tracking-wider text-white/40">
          Dokumentasi Kegiatan
        </h3>
      </div>

      {isLoading ? (
        <div className="py-6 text-center">
          {/* Glass skeleton shimmer */}
          <div className="flex gap-3 justify-center">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-[72px] h-[96px] rounded-xl animate-pulse glass-subtle"
                style={{
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>
        </div>
      ) : displayPhotos.length === 0 ? (
        <div
          className="py-6 text-center rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.07)',
          }}
        >
          <p className="text-xs font-mono text-white/25">
            Tidak ada dokumentasi pada tanggal ini
          </p>
        </div>
      ) : (
        <div
          className={`flex flex-wrap gap-4 pt-2 px-1 transition-opacity duration-200 ${
            transitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {displayPhotos.map((photo, idx) => {
            const delayMs = idx < 6 ? `${idx * 100 + 100}ms` : '0ms'
            return (
              <div
                key={photo.url}
                className="group relative flex flex-col items-center cursor-pointer animate-slide-right"
                style={{ animationDelay: delayMs }}
                onClick={() => setSelectedPhoto(photo)}
              >
                {/* Photo card — parallelogram + glass border */}
                <div className="photo-card relative w-[90px] h-[120px] overflow-hidden shadow-md">
                  {/* Inner unskewed wrapper */}
                  <div
                    className="w-full h-full relative"
                    style={{ transform: 'skewX(calc(-1 * var(--card-skew))) scale(1.2)' }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || photo.jurnalTitle}
                      className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
                      style={{
                        opacity: 0,
                        background: 'rgba(0,0,0,0.35)',
                        backdropFilter: 'blur(2px)',
                      }}
                      ref={el => {
                        if (!el) return
                        const parent = el.parentElement?.parentElement
                        if (!parent) return
                        parent.parentElement?.addEventListener('mouseenter', () => { el.style.opacity = '1' })
                        parent.parentElement?.addEventListener('mouseleave', () => { el.style.opacity = '0' })
                      }}
                    >
                      <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Caption tooltip */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 text-center whitespace-nowrap z-10 pointer-events-none">
                  <div className="font-bold text-xs text-white truncate max-w-[120px]">
                    {photo.caption || 'Dokumentasi'}
                  </div>
                  <div className="text-[9px] font-mono uppercase text-white/35 truncate max-w-[120px]">
                    {photo.jurnalTitle}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}      {/* ── Lightbox ── Portal ke document.body agar fixed = true viewport */}
      {selectedPhoto && typeof document !== 'undefined' && ReactDOM.createPortal(
        /*
         * Outer div = backdrop + click-to-close.
         * Backdrop style langsung di sini — tidak ada layer absolut terpisah
         * yang bisa menginterrupt event bubbling.
         */
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center cursor-zoom-out animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
          style={{
            background: 'rgba(4, 4, 8, 0.75)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            padding: '5vh 15vw',
          }}
        >
          {/*
           * Inner content wrapper.
           * stopPropagation → klik di sini tidak menutup.
           * position: relative → X button diposisikan relatif ke wrapper ini.
           */}
          <div
            className="relative flex flex-col items-center gap-4 cursor-default animate-scale-in"
            style={{ maxWidth: '800px', width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            {/* X button — top-right corner dari foto, bukan viewport */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute flex items-center justify-center transition-all duration-200"
              style={{
                top: '-14px',
                right: '-14px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.10)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.70)',
                cursor: 'pointer',
                zIndex: 1,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.22)'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.70)'
              }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Photo */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || selectedPhoto.jurnalTitle}
              style={{
                maxWidth: '100%',
                maxHeight: '72vh',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
                display: 'block',
              }}
            />

            {/* Caption pill */}
            <div className="text-center px-5 py-2.5 rounded-2xl w-full glass-subtle">
              <h4 className="text-white text-sm font-bold mb-0.5">
                {selectedPhoto.caption || 'Dokumentasi Kegiatan'}
              </h4>
              <p className="text-xs text-white/40 font-mono">
                {selectedPhoto.jurnalTitle}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default DocumentationPanel
