'use client'

import React, { useState, useEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SearchBar } from '@/features/jurnal-filter/ui/search-bar.client'
import { KategoriDropdown } from '@/features/jurnal-filter/ui/kategori-dropdown.client'
import { useJurnalFilter } from '@/features/jurnal-filter/lib/use-jurnal-filter'
import { JurnalList } from '@/widgets/jurnal-list/ui'
import { CalendarWidget } from '@/widgets/calendar-widget/ui'
import { DocumentationPanel } from '@/widgets/documentation-panel/ui'
import { FuturisticLine } from '@/shared/ui/futuristic-line'
import { JurnalDetailModal } from '@/entities/jurnal/ui/jurnal-detail-modal.client'
import { StatsSection } from '@/widgets/stats-section/ui'
import { AuthButton } from '@/features/lawet-auth/ui/auth-button.client'
import {
  HeroLogoReveal,
  HeroTitleReveal,
  HeroSubtitleReveal,
} from './hero-text-reveal.client'

const queryClient = new QueryClient()

const LandingView: React.FC<{ heroImagePath: string; heroTitle: string; heroSubtitle: string }> = ({ heroImagePath, heroTitle, heroSubtitle }) => {
  const { q, kategori, setFilter, resetFilter } = useJurnalFilter()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [selectedJurnalId, setSelectedJurnalId] = useState<string | null>(null)

  const [scrollY, setScrollY] = useState(0)
  const [vhPx, setVhPx] = useState(800)

  const [hoverLine, setHoverLine] = useState<{ id: string; date: string } | null>(null)
  const listScrollRef = useRef<HTMLDivElement>(null)
  // Flag yang memblokir IntersectionObserver selama scroll programatik dari kalender
  const navigatingRef = useRef<boolean>(false)

  const [isSection3Visible, setIsSection3Visible] = useState(false)
  const section3Ref = useRef<HTMLElement>(null)

  useEffect(() => {
    setVhPx(window.innerHeight)
    const onScroll = () => setScrollY(window.scrollY)
    const onResize = () => setVhPx(window.innerHeight)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    const el = section3Ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsSection3Visible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleDateClick = (dateStr: string) => {
    setHoverLine(null)
    setActiveDate(dateStr)
    if (q || kategori) resetFilter()
    // Kunci observer agar tidak menimpa activeDate/activeId saat scroll berlangsung
    navigatingRef.current = true
    setTimeout(() => {
      const el = listScrollRef.current?.querySelector(`[data-tanggal="${dateStr}"]`)
      if (el) {
        // Set activeId langsung dari elemen yang ditemukan — jangan tunggu observer
        const cardId = el.id.replace('jurnal-card-', '')
        setActiveId(cardId)
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      // Lepas kunci setelah smooth scroll selesai (~1000ms)
      setTimeout(() => { navigatingRef.current = false }, 1000)
    }, 100)
  }

  const progress = Math.min(scrollY / (vhPx || 800), 1)
  const bannerTranslate = scrollY * 0.4
  const titleTranslateY = -scrollY * 0.6
  const subtitleOpacity = Math.max(1 - progress * 3, 0)
  const navProgress = Math.max(0, Math.min((progress - 0.7) / 0.3, 1))
  const navVisible = navProgress > 0

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative bg-[var(--color-canvas)] overflow-x-hidden min-h-screen">

        {/* SECTION 1 — HERO */}
        <section
          className="relative w-full overflow-hidden"
          style={{ height: '100vh' }}
        >
          <div
            className="absolute bg-cover bg-center will-change-transform"
            style={{
              backgroundImage: `url('${heroImagePath}')`,
              filter: 'grayscale(60%) brightness(50%) contrast(110%)',
              transform: `translateY(${bannerTranslate}px)`,
              inset: '-15% 0 0 0',
              height: '130%',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-canvas)] via-[var(--color-canvas)]/30 to-black/20 z-10" />

          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none select-none will-change-transform"
            style={{ transform: `translateY(${titleTranslateY}px)` }}
          >
            <HeroLogoReveal
              src="/assets/logo.png"
              alt="Bawaslu Kebumen"
              style={{
                opacity: subtitleOpacity > 0 ? subtitleOpacity : 0,
              }}
            />
            <HeroTitleReveal title={heroTitle} className="leading-none" />
            <HeroSubtitleReveal
              subtitle={heroSubtitle}
              style={{ opacity: subtitleOpacity }}
            />

            <div
              className="mt-12 flex flex-col items-center gap-3"
              style={{ opacity: subtitleOpacity }}
            >
              <button
                aria-label="Scroll ke Arsip Jurnal"
                onClick={() => {
                  document.getElementById('section-arsip')?.scrollIntoView({ behavior: 'smooth' })
                }}
                style={{
                  pointerEvents: 'auto',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 28px 16px',
                  borderRadius: '999px',
                  background: '#FAF7F0',
                  border: '1px solid #E4DDD0',
                  boxShadow: '0 4px 16px rgba(90, 75, 55, 0.1)',
                  cursor: 'pointer',
                  outline: 'none',
                  userSelect: 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                <span
                  style={{
                    fontSize: '0.6rem',
                    letterSpacing: '0.38em',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontWeight: 500,
                    color: '#211E1B',
                  }}
                >
                  SCROLL
                </span>
                <svg
                  width="14"
                  height="8"
                  viewBox="0 0 14 8"
                  fill="none"
                  style={{ opacity: 0.7, marginTop: '-2px' }}
                >
                  <path
                    d="M1 1l6 6 6-6"
                    stroke="#211E1B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2 — STATS */}
        <StatsSection />

        {/* SECTION 3 — ARSIP JURNAL */}
        <section
          id="section-arsip"
          ref={section3Ref}
          className="relative w-full bg-[var(--color-canvas)] lg:h-screen lg:overflow-hidden"
        >
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-6 lg:pb-8 flex flex-col lg:h-screen">
            <div className="
              grid grid-cols-1 lg:grid-cols-5
              gap-6 lg:gap-8
              lg:flex-1 lg:min-h-0
            ">
              <div
                ref={listScrollRef}
                className="
                  col-span-1 lg:col-span-3
                  lg:overflow-y-auto lg:min-h-0
                  pr-0 lg:pr-2
                  transition-all duration-700 ease-out
                "
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#D6CBB5 transparent',
                  opacity: isSection3Visible ? 1 : 0,
                  transform: isSection3Visible ? 'translateY(0)' : 'translateY(32px)',
                  transitionDelay: '0ms',
                }}
              >
                <JurnalList
                  q={q}
                  kategori={kategori}
                  activeId={activeId}
                  setActiveId={setActiveId}
                  onActiveDateChange={setActiveDate}
                  onCardClick={setSelectedJurnalId}
                  scrollContainerRef={listScrollRef}
                  lineTargetId={hoverLine?.id ?? activeId}
                  onHover={(id, date) => setHoverLine({ id, date })}
                  onLeaveHover={() => setHoverLine(null)}
                  navigatingRef={navigatingRef}
                />
              </div>

              <div
                className="col-span-1 lg:col-span-2 flex flex-col gap-5 lg:overflow-hidden lg:min-h-0 transition-all duration-700 ease-out"
                style={{
                  opacity: isSection3Visible ? 1 : 0,
                  transform: isSection3Visible ? 'translateY(0)' : 'translateY(40px)',
                  transitionDelay: '120ms',
                }}
              >
                <div className="flex-shrink-0">
                  <DocumentationPanel
                    activeDate={hoverLine?.date ?? activeDate}
                  />
                </div>
                <div className="flex-shrink-0">
                  <CalendarWidget
                    activeDate={hoverLine?.date ?? activeDate}
                    onDateClick={handleDateClick}
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Sticky header */}
        <header
          className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
          style={{
            backgroundColor: `rgba(244, 240, 230, ${navProgress * 0.95})`,
            backdropFilter: `blur(${navProgress * 28}px)`,
            WebkitBackdropFilter: `blur(${navProgress * 28}px)`,
            borderBottom: `1px solid rgba(228, 221, 208, ${navProgress})`,
            boxShadow: `0 4px 16px rgba(90, 75, 55, ${navProgress * 0.08})`,
            transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
            opacity: navProgress,
            pointerEvents: navVisible ? 'auto' : 'none',
            height: '64px',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 select-none flex-shrink-0">
              <div
                className="flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#FAF7F0',
                  border: '1px solid #E4DDD0',
                }}
              >
                <img
                  src="/assets/logo.png"
                  alt="Bawaslu"
                  style={{ width: '20px', height: '20px' }}
                  className="object-contain"
                />
              </div>
              <span
                className="text-[#211E1B] font-serif font-bold text-sm sm:text-base"
                style={{ letterSpacing: '0.05em' }}
              >
                {heroTitle}
              </span>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <div className="w-28 xs:w-40 sm:w-48 md:w-64">
                <SearchBar value={q} onChange={(val) => setFilter(val, kategori)} />
              </div>
              <KategoriDropdown value={kategori} onChange={(val) => setFilter(q, val)} />
              <div className="ml-1 sm:ml-2 border-l border-[#E4DDD0] pl-2 sm:pl-3 flex items-center h-8">
                <AuthButton />
              </div>
            </div>
          </div>
        </header>

        <JurnalDetailModal
          id={selectedJurnalId}
          isOpen={!!selectedJurnalId}
          onClose={() => setSelectedJurnalId(null)}
        />

        {!selectedJurnalId && (
          <div className="hidden lg:block">
            <FuturisticLine
              activeId={hoverLine?.id ?? activeId}
              activeDate={hoverLine?.date ?? activeDate}
              scrollContainerRef={listScrollRef}
            />
          </div>
        )}
      </div>
    </QueryClientProvider>
  )
}

export default LandingView
