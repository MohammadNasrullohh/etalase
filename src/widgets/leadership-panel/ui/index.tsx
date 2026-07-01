'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LeaderCard } from '@/entities/pimpinan/ui/leader-card'

interface LeadershipPanelProps {
  activeDate: string | null
  onLeaderClick: (id: string) => void
}

export const LeadershipPanel: React.FC<LeadershipPanelProps> = ({ activeDate, onLeaderClick }) => {
  const queryDate = activeDate || new Date().toISOString().split('T')[0]

  const { data: response } = useQuery({
    queryKey: ['pimpinan', queryDate],
    queryFn: () => fetch(`/api/pimpinan?date=${queryDate}`).then(r => {
      if (!r.ok) throw new Error('Network error')
      return r.json()
    }),
    staleTime: 10 * 60 * 1000,
  })

  const pimpinanList = response?.data || []
  const currentKey = pimpinanList.map((p: any) => p.id).join(',')
  
  const [transitioning, setTransitioning] = useState(false)
  const [displayList, setDisplayList] = useState<any[]>([])
  const [prevKey, setPrevKey] = useState('')

  useEffect(() => {
    if (currentKey !== prevKey) {
      if (!prevKey) {
        setDisplayList(pimpinanList)
        setPrevKey(currentKey)
      } else {
        setTransitioning(true)
        const t = setTimeout(() => {
          setDisplayList(pimpinanList)
          setTransitioning(false)
          setPrevKey(currentKey)
        }, 200)
        return () => clearTimeout(t)
      }
    }
  }, [currentKey, pimpinanList, prevKey])

  return (
    <div className="leadership-panel p-6 bg-neutral-900/30 border border-neutral-800 rounded-sm shadow-xl mb-6">
      <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
        Pimpinan Periode Kegiatan
      </h3>
      
      {displayList.length === 0 ? (
        <div className="py-6 text-center text-xs font-mono text-[var(--color-text-muted)]">
          Tidak ada data pimpinan periode ini
        </div>
      ) : (
        <div 
          className={`flex flex-wrap gap-4 pt-2 px-1 transition-opacity duration-200 ${
            transitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {displayList.map((p, idx) => {
            const delayMs = idx < 4 ? `${idx * 120 + 100}ms` : '0ms'
            return (
              <LeaderCard
                key={p.id}
                id={p.id}
                nama={p.nama}
                jabatan={p.jabatan}
                foto_url={p.foto_url}
                staggerDelay={delayMs}
                onClick={() => onLeaderClick(p.id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
export default LeadershipPanel
