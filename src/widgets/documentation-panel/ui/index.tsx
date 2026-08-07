'use client'

import React, { useState, useEffect, useMemo } from 'react'
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

  const photos = useMemo<PhotoItem[]>(() => {
    const jurnals = response?.data || []
    return jurnals.flatMap((jurnal: any) => {
      const docs = Array.isArray(jurnal.dokumentasi) ? jurnal.dokumentasi : []
      return docs
        .filter((doc: any) => doc && doc.type === 'image')
        .map((doc: any) => ({
          ...doc,
          jurnalTitle: jurnal.judul,
        }))
    })
  }, [response?.data])

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
      className="documentation-panel mb-6 glass-card"
      style={{
        padding: '20px 24px',
      }}
    >
      {/* Panel header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-1.5 h-4 rounded-full"
          style={{ background: '#F5B748' }}
        />
        <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#7E7365]">
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
            background: '#FAF7F0',
            border: '1px dashed #D6CBB5',
          }}
        >
          <p className="text-xs font-mono text-[#7E7365]">
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
                className="group relative flex flex-col items-center cursor-pointer animate-slide-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B748] rounded-xl"
                style={{ animationDelay: delayMs }}
                onClick={() => setSelectedPhoto(photo)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedPhoto(photo)
                  }
                }}
              >
                {/* Photo card — parallelogram + border */}
                <div className="photo-card relative w-[90px] h-[120px] overflow-hidden shadow-md">
                  {/* Inner unskewed wrapper */}
                  <div
                    className="w-full h-full relative"
                    style={{ transform: 'skewX(calc(-1 * var(--card-skew))) scale(1.2)' }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || photo.jurnalTitle}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      <Maximize2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Caption tooltip */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 text-center whitespace-nowrap z-10 pointer-events-none bg-[#FAF7F0] border border-[#E4DDD0] p-1.5 rounded-lg shadow-md">
                  <div className="font-bold text-xs text-[#211E1B] truncate max-w-[120px]">
                    {photo.caption || 'Dokumentasi'}
                  </div>
                  <div className="text-[9px] font-mono uppercase text-[#7E7365] truncate max-w-[120px]">
                    {photo.jurnalTitle}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center cursor-zoom-out animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
          style={{
            background: 'rgba(33, 30, 27, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '5vh 15vw',
          }}
        >
          <div
            className="relative flex flex-col items-center gap-4 cursor-default animate-scale-in"
            style={{ maxWidth: '800px', width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute flex items-center justify-center transition-all duration-200 w-8 h-8 rounded-full bg-[#FAF7F0] border border-[#E4DDD0] text-[#211E1B] hover:bg-[#F4F0E6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B748] z-10 cursor-pointer"
              style={{
                top: '-14px',
                right: '-14px',
              }}
            >
              <X className="w-4 h-4" />
            </button>

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
                boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
                display: 'block',
              }}
            />

            <div className="text-center px-5 py-2.5 rounded-2xl w-full bg-[#FAF7F0] border border-[#E4DDD0]">
              <h4 className="text-[#211E1B] text-sm font-bold mb-0.5">
                {selectedPhoto.caption || 'Dokumentasi Kegiatan'}
              </h4>
              <p className="text-xs text-[#7E7365] font-mono">
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
