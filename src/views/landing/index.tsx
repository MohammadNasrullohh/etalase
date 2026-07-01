'use client'

import React, { useState, useEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SearchBar } from '@/features/jurnal-filter/ui/search-bar.client'
import { KategoriDropdown } from '@/features/jurnal-filter/ui/kategori-dropdown.client'
import { useJurnalFilter } from '@/features/jurnal-filter/lib/use-jurnal-filter'
import { JurnalList } from '@/widgets/jurnal-list/ui'
import { CalendarWidget } from '@/widgets/calendar-widget/ui'
import { LeadershipPanel } from '@/widgets/leadership-panel/ui'
import { FuturisticLine } from '@/shared/ui/futuristic-line'
import { JurnalDetailModal } from '@/entities/jurnal/ui/jurnal-detail-modal.client'
import { LeaderProfileModal } from '@/entities/pimpinan/ui/leader-profile-modal.client'
import { StatsSection } from '@/widgets/stats-section/ui'

const queryClient = new QueryClient()

export const LandingView: React.FC = () => {
  const { q, kategori, setFilter, resetFilter } = useJurnalFilter()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [selectedJurnalId, setSelectedJurnalId] = useState<string | null>(null)
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null)

  // Scroll state untuk animasi hero
  const [scrollY, setScrollY] = useState(0)
  const [vhPx, setVhPx] = useState(800)

  // Hover state untuk FuturisticLine — satu object agar atomic (tidak intermediate render)
  const [hoverLine, setHoverLine] = useState<{ id: string; date: string } | null>(null)

  // Ref untuk internal scroll container jurnal list
  const listScrollRef = useRef<HTMLDivElement>(null)

  // Section 3 visibility — animasi masuk saat section arsip terlihat
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

  // IntersectionObserver untuk Section 3
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
    if (q || kategori) resetFilter()
    setTimeout(() => {
      const el = listScrollRef.current?.querySelector(`[data-tanggal="${dateStr}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const kelolaUrl = process.env.NEXT_PUBLIC_LAWET_HUB_ADMIN_URL || 'https://lawethub.pusdakum.web.id/superadmin/jurnal-alas'

  // Hero animation: progress 0→1 selama scroll 0→vhPx (section 1 habis)
  const progress = Math.min(scrollY / (vhPx || 800), 1)

  // Banner parallax: bergerak lambat ke atas (lebih lambat dari scroll agar kelihatan depth)
  const bannerTranslate = scrollY * 0.4

  // Title ΛLΛS: translasi ke atas 60% dari scroll, tapi stop di section boundary
  const titleTranslateY = -scrollY * 0.6

  // Subtitle: hilang di 33% pertama scroll
  const subtitleOpacity = Math.max(1 - progress * 3, 0)

  // Navbar sticky: mulai muncul saat 70% hero habis, fully visible di 100%
  const navProgress = Math.max(0, Math.min((progress - 0.7) / 0.3, 1))
  const navVisible = navProgress > 0

  return (
    <QueryClientProvider client={queryClient}>
      {/*
       * Layout — 3 Section:
       * ┌─────────────────────────────────────────┐  ← page scroll (window)
       * │  SECTION 1 — Hero (100vh)                │
       * │  ΛLΛS bergerak naik saat di-scroll        │
       * ├─────────────────────────────────────────┤  ← navbar sticky muncul di sini
       * │  SECTION 2 — Stats/Chart (100vh)         │
       * │  Rekapitulasi kegiatan tahunan (D3)      │
       * ├─────────────────────────────────────────┤
       * │  SECTION 3 — Arsip Jurnal (100vh)        │
       * │  ┌──────────────┬──────────────────────┐ │
       * │  │ Jurnal List  │ Pimpinan + Calendar   │ │
       * │  └──────────────┴──────────────────────┘ │
       * └─────────────────────────────────────────┘
       *   Page total = 300vh.
      */}
      <div className="relative bg-[#08080C] overflow-x-hidden">

        {/* ═══════════════════════════════════════════
            SECTION 1 — HERO (100vh)
            Mengambil full viewport. Scroll window menyebabkan
            title ΛLΛS bergerak naik.
        ═══════════════════════════════════════════ */}
        <section
          className="relative w-full overflow-hidden"
          style={{ height: '100vh' }}
        >
          {/* Banner parallax background */}
          <div
            className="absolute bg-cover bg-center will-change-transform"
            style={{
              backgroundImage: "url('/assets/banner-image.jpg')",
              filter: 'grayscale(100%) brightness(40%) contrast(130%)',
              transform: `translateY(${bannerTranslate}px)`,
              inset: '-15% 0 0 0',
              height: '130%',
            }}
          />

          {/* Gradient blend ke Section 2 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080C] via-[#08080C]/5 to-black/25 z-10" />

          {/* Title area — bergerak naik bersama scroll */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none select-none will-change-transform"
            style={{ transform: `translateY(${titleTranslateY}px)` }}
          >
            {/* Logo Bawaslu */}
            <img
              src="/assets/logo.png"
              alt="Bawaslu Kebumen"
              className="object-contain mb-5"
              style={{
                width: '68px',
                height: '68px',
                filter: 'brightness(0) invert(1)',
                opacity: subtitleOpacity > 0 ? 1 : 0,
                transition: 'opacity 0.15s ease',
              }}
            />

            {/* ΛLΛS */}
            <h1
              className="text-white leading-none"
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(3.5rem, 11vw, 8rem)',
                letterSpacing: '0.22em',
              }}
            >
              ΛLΛS
            </h1>

            {/* Subtitle */}
            <p
              className="text-[var(--color-text-muted)] mt-4 tracking-[0.3em]"
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 300,
                fontSize: '0.85rem',
                opacity: subtitleOpacity,
              }}
            >
              ARSIP LANGKAH BAWASLU KEBUMEN
            </p>

            {/* Scroll hint */}
            <div
              className="mt-10 flex flex-col items-center gap-2"
              style={{ opacity: subtitleOpacity }}
            >
              <span
                className="text-[var(--color-text-muted)]"
                style={{ fontSize: '0.6rem', letterSpacing: '0.35em', fontFamily: 'Roboto, sans-serif' }}
              >
                SCROLL
              </span>
              <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 2 — STATS / CHART (100vh)
            Rekapitulasi kegiatan tahunan menggunakan D3.js bar chart.
            Navbar sticky muncul saat masuk section ini.
        ═══════════════════════════════════════════ */}
        <StatsSection />

        {/* ═══════════════════════════════════════════
            SECTION 3 — ARSIP JURNAL (100vh)
            Jurnal List + Pimpinan + Kalender
        ═══════════════════════════════════════════ */}
        <section
          id="section-arsip"
          ref={section3Ref}
          className="relative w-full bg-[#08080C] lg:h-screen lg:overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute top-0 left-[-15%] w-[55vw] h-[55vw] rounded-full bg-glow-purple pointer-events-none opacity-25" />
          <div className="absolute bottom-0 right-[-10%] w-[45vw] h-[45vw] rounded-full bg-glow-blue pointer-events-none opacity-30" />

          {/* Padded container — pt-20 agar tidak tertutup sticky navbar */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-6 lg:pb-8 flex flex-col lg:h-screen">
            {/* ── Content grid ── */}
            <div className="
              grid grid-cols-1 lg:grid-cols-5
              gap-6 lg:gap-8
              lg:flex-1 lg:min-h-0
            ">
              {/* Jurnal List:
                  Mobile  → normal flow (window scroll)
                  Desktop → internal overflow-y-auto */}
              {/* Jurnal List — animasi fade-up dari kiri */}
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
                  scrollbarColor: 'rgba(255,255,255,0.08) transparent',
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
                />
              </div>

              {/* Kanan: Pimpinan + Calendar — animasi fade-up staggered */}
              <div
                className="col-span-1 lg:col-span-2 flex flex-col gap-5 lg:overflow-hidden lg:min-h-0 transition-all duration-700 ease-out"
                style={{
                  opacity: isSection3Visible ? 1 : 0,
                  transform: isSection3Visible ? 'translateY(0)' : 'translateY(40px)',
                  transitionDelay: '120ms',
                }}
              >
                <div className="flex-shrink-0">
                  <LeadershipPanel
                    activeDate={hoverLine?.date ?? activeDate}
                    onLeaderClick={setSelectedLeaderId}
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

        {/* ─── Sticky header glass — muncul saat masuk ke Section 2 ─── */}
        <header
          className="fixed top-0 left-0 w-full z-50 border-b transition-all duration-300"
          style={{
            backgroundColor: `rgba(8, 8, 12, ${navProgress * 0.9})`,
            backdropFilter: `blur(${navProgress * 20}px)`,
            borderColor: `rgba(38, 38, 38, ${navProgress * 0.5})`,
            transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
            opacity: navProgress,
            pointerEvents: navVisible ? 'auto' : 'none',
            height: '64px',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-3">
            {/* Brand - always visible */}
            <div className="flex items-center gap-2.5 sm:gap-3 select-none flex-shrink-0">
              <img
                src="/assets/logo.png"
                alt="Bawaslu"
                style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }}
                className="object-contain"
              />
              <span
                className="text-white font-bold text-sm sm:text-base"
                style={{ fontFamily: 'Roboto, sans-serif', letterSpacing: '0.15em' }}
              >
                ΛLΛS
              </span>
            </div>

            {/* Search + filter */}
            <div className="flex items-center gap-2 justify-end">
              <div className="w-28 xs:w-40 sm:w-48 md:w-64">
                <SearchBar value={q} onChange={(val) => setFilter(val, kategori)} />
              </div>
              <KategoriDropdown value={kategori} onChange={(val) => setFilter(q, val)} />
            </div>
          </div>
        </header>

        <JurnalDetailModal
          id={selectedJurnalId}
          isOpen={!!selectedJurnalId}
          onClose={() => setSelectedJurnalId(null)}
        />
        <LeaderProfileModal
          id={selectedLeaderId}
          isOpen={!!selectedLeaderId}
          onClose={() => setSelectedLeaderId(null)}
        />

        {/* FuturisticLine — hanya desktop, disembunyikan saat modal aktif */}
        {!selectedJurnalId && !selectedLeaderId && (
          <div className="hidden lg:block">
            <FuturisticLine
              activeId={hoverLine?.id ?? activeId}
              activeDate={hoverLine?.date ?? activeDate}
            />
          </div>
        )}
      </div>
    </QueryClientProvider>
  )
}

export default LandingView
