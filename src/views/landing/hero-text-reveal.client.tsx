'use client'

import React, { useEffect, useRef, useState } from 'react'

// ─── Konstanta ────────────────────────────────────────────────────────────────
const SYMBOLS = '!@#$%^&*?><":~|'
const TITLE_CHARS = ['Λ', 'L', 'Λ', 'S']

// ─── Helper ───────────────────────────────────────────────────────────────────
const randomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]

/**
 * easeOutExpo — semakin tinggi t, semakin jarang simbol berganti.
 */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

const shouldFlip = (scrambleProgress: number): boolean => {
  const ease = easeOutExpo(Math.min(scrambleProgress, 1))
  const probability = 1 - ease * 0.95
  return Math.random() < probability
}

// ─── HeroTitleReveal ──────────────────────────────────────────────────────────
/**
 * Tiap huruf ΛLΛS scramble lalu reveal satu per satu, kiri ke kanan.
 * Total: 1.3s
 */
export const HeroTitleReveal: React.FC<{
  className?: string
  style?: React.CSSProperties
}> = ({ className, style }) => {
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false, false])
  const [display, setDisplay] = useState<string[]>(
    () => TITLE_CHARS.map(() => randomSymbol())
  )

  // Ref agar closure tick selalu baca state terbaru (hindari stale closure)
  const displayRef = useRef<string[]>(display)
  const rafRef     = useRef<number | null>(null)
  const startRef   = useRef<number | null>(null)

  useEffect(() => {
    displayRef.current = display
  }, [display])

  useEffect(() => {
    const TOTAL  = 1300  // ms
    const STEP   = 250   // ms antar-mulai huruf
    const WINDOW = 350   // ms jendela scramble per huruf

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now
      const elapsed = now - startRef.current

      const newDisplay = TITLE_CHARS.map((char, i) => {
        const letterStart  = i * STEP
        const letterReveal = letterStart + WINDOW

        if (elapsed >= letterReveal) return char

        if (elapsed < letterStart) return randomSymbol()

        const progress = (elapsed - letterStart) / WINDOW
        const prev = displayRef.current[i]
        return shouldFlip(progress) ? randomSymbol() : (prev ?? randomSymbol())
      })

      const newRevealed = TITLE_CHARS.map(
        (_, i) => elapsed >= i * STEP + WINDOW
      )

      setDisplay(newDisplay)
      setRevealed(newRevealed)

      if (elapsed < TOTAL) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay([...TITLE_CHARS])
        setRevealed([true, true, true, true])
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <h1
      className={className}
      style={{
        fontFamily: 'Roboto, sans-serif',
        fontWeight: 700,
        fontSize: 'clamp(3.5rem, 11vw, 8rem)',
        letterSpacing: '0.22em',
        color: '#ffffff',
        ...style,
      }}
    >
      {display.map((char, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            minWidth: '0.6em',
            textAlign: 'center',
            color: revealed[i] ? '#ffffff' : 'rgba(255,255,255,0.45)',
            transition: revealed[i]
              ? 'color 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none',
          }}
        >
          {char}
        </span>
      ))}
    </h1>
  )
}

// ─── HeroSubtitleReveal ───────────────────────────────────────────────────────
const SUBTITLE_TEXT = 'ARSIP LANGKAH BAWASLU KEBUMEN'
const SUBTITLE_CHARS = SUBTITLE_TEXT.split('')

/**
 * Scramble + reveal seluruh karakter subtitle, kiri ke kanan.
 * Delay: 150ms. Selesai: ~1.25s.
 */
export const HeroSubtitleReveal: React.FC<{
  style?: React.CSSProperties
}> = ({ style }) => {
  const [display, setDisplay] = useState<string>(() =>
    SUBTITLE_CHARS.map(c => (c === ' ' ? ' ' : randomSymbol())).join('')
  )

  const rafRef     = useRef<number | null>(null)
  const startRef   = useRef<number | null>(null)
  const displayRef = useRef<string>(display)

  useEffect(() => {
    displayRef.current = display
  }, [display])

  useEffect(() => {
    const DELAY = 150
    const TOTAL = 1100

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now
      const elapsed = now - startRef.current - DELAY

      if (elapsed < 0) {
        setDisplay(
          SUBTITLE_CHARS.map(c => (c === ' ' ? ' ' : randomSymbol())).join('')
        )
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const progress = Math.min(elapsed / TOTAL, 1)
      // easeOutQuart: cepat di awal, melambat di akhir
      const eased = 1 - Math.pow(1 - progress, 4)
      const revealedCount = Math.floor(eased * SUBTITLE_CHARS.length)

      const prevChars = displayRef.current.split('')
      const built = SUBTITLE_CHARS.map((c, i) => {
        if (i < revealedCount) return c
        if (c === ' ') return ' '
        const charProgress = Math.max(0, (eased * SUBTITLE_CHARS.length - i) / 3)
        return shouldFlip(Math.min(charProgress, 1))
          ? randomSymbol()
          : (prevChars[i] ?? randomSymbol())
      }).join('')

      setDisplay(built)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(SUBTITLE_TEXT)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <p
      className="text-[var(--color-text-muted)] mt-4 tracking-[0.3em]"
      style={{
        fontFamily: 'Roboto, sans-serif',
        fontWeight: 300,
        fontSize: '0.85rem',
        ...style,
      }}
    >
      {display}
    </p>
  )
}

// ─── HeroLogoReveal ───────────────────────────────────────────────────────────
/**
 * Logo Bawaslu muncul dari atas: slide down + fade in.
 */
export const HeroLogoReveal: React.FC<{
  src: string
  alt: string
  style?: React.CSSProperties
}> = ({ src, alt, style }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40)
    return () => clearTimeout(t)
  }, [])

  return (
    <img
      src={src}
      alt={alt}
      className="object-contain mb-5"
      style={{
        width: '68px',
        height: '68px',
        filter: 'brightness(0) invert(1)',
        transform: mounted ? 'translateY(0px)' : 'translateY(-48px)',
        opacity: mounted ? 1 : 0,
        transition: [
          'transform 0.6s cubic-bezier(0.34, 1.3, 0.64, 1)',
          'opacity 0.45s ease-out',
        ].join(', '),
        ...style,
      }}
    />
  )
}
