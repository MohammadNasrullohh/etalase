'use client'

import React, { useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { JurnalCard } from '@/entities/jurnal/ui/jurnal-card'

interface JurnalListProps {
  q: string
  kategori: string
  activeId: string | null
  setActiveId: (id: string | null) => void
  onActiveDateChange: (date: string) => void
  onCardClick: (id: string) => void
  onHover?: (id: string, date: string) => void
  onLeaveHover?: () => void
  lineTargetId?: string | null  // card yang sedang dituju FuturisticLine
  /** If provided, infinite scroll uses this ref's scroll instead of window scroll */
  scrollContainerRef?: React.RefObject<HTMLDivElement>
}

export const JurnalList: React.FC<JurnalListProps> = ({
  q,
  kategori,
  activeId,
  setActiveId,
  onActiveDateChange,
  onCardClick,
  onHover,
  onLeaveHover,
  lineTargetId,
  scrollContainerRef,
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ['jurnals', q, kategori],
    queryFn: ({ pageParam = '' }) => {
      const url = new URL('/api/jurnal', window.location.origin)
      if (q) url.searchParams.set('q', q)
      if (kategori) url.searchParams.set('kategori', kategori)
      if (pageParam) url.searchParams.set('cursor', pageParam as string)
      return fetch(url.toString()).then(r => {
        if (!r.ok) throw new Error('Network error')
        return r.json()
      })
    },
    getNextPageParam: (lastPage) => lastPage?.pagination?.next_cursor || undefined,
    initialPageParam: '',
  })

  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection observer — gunakan root dari scrollContainerRef jika ada
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = entry.target.id.replace('jurnal-card-', '')
            const date = entry.target.getAttribute('data-tanggal')
            setActiveId(cardId)
            if (date) {
              onActiveDateChange(date)
            }
          }
        })
      },
      {
        root: scrollContainerRef?.current ?? null,
        rootMargin: '-30% 0px -30% 0px',
        threshold: 0,
      }
    )

    const cards = document.querySelectorAll('.jurnal-card')
    cards.forEach((card) => observerRef.current?.observe(card))

    return () => observerRef.current?.disconnect()
  }, [data, setActiveId, onActiveDateChange, scrollContainerRef])

  // Infinite scroll — gunakan scroll container jika ada, fallback ke window
  useEffect(() => {
    const container = scrollContainerRef?.current

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement
      const scrolledToBottom = container
        ? target.scrollTop + target.clientHeight >= target.scrollHeight - 300
        : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300

      if (scrolledToBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }

    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    } else {
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, scrollContainerRef])

  if (isLoading) {
    return <div className="py-12 text-center text-[var(--color-text-muted)] font-mono">Memuat arsip...</div>
  }

  if (isError) {
    return <div className="py-12 text-center text-red-500 font-mono">Error: {(error as Error).message}</div>
  }

  const pages = data?.pages || []
  const allItems = pages.flatMap(page => page?.data || [])

  if (allItems.length === 0) {
    return (
      <div className="py-12 text-center text-[var(--color-text-muted)]">
        <p className="mb-4">Tidak ada jurnal kegiatan ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="jurnal-list-container">
      {allItems.map((item, idx) => {
        const delayMs = idx < 5 ? `${idx * 120 + 200}ms` : '0ms'
        return (
          <JurnalCard
            key={item.id}
            id={item.id}
            judul={item.judul}
            tanggal_kegiatan={item.tanggal_kegiatan}
            kategori={item.kategori}
            thumbnail_url={item.thumbnail_url}
            pihak_terkait={item.pihak_terkait}
            isActive={activeId === item.id}
            isLineTarget={lineTargetId === item.id}
            staggerDelay={delayMs}
            onClick={() => onCardClick(item.id)}
            onHover={onHover}
            onLeaveHover={onLeaveHover}
          />
        )
      })}
      {isFetchingNextPage && (
        <div className="py-6 text-center text-[var(--color-text-muted)] font-mono text-xs">
          Memuat lebih banyak...
        </div>
      )}
    </div>
  )
}
export default JurnalList
