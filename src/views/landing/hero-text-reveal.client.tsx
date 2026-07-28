'use client'

import React, { useEffect, useRef, useState } from 'react'

const SYMBOLS = '!@#$%^&*?><":~|'
const SUBTITLE_TEXT = 'ARSIP LANGKAH BAWASLU KEBUMEN'
const SUBTITLE_CHARS = Array.from(SUBTITLE_TEXT)

const randomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

function shouldFlip(progress: number): boolean {
  return Math.random() < 1 - easeOutExpo(Math.min(progress, 1)) * 0.95
}

export const HeroTitleReveal: React.FC<{
  title: string
  className?: string
  style?: React.CSSProperties
}> = ({ title, className, style }) => {
  const titleChars = Array.from(title)
  const [revealed, setRevealed] = useState<boolean[]>(() => titleChars.map(() => false))
  const [display, setDisplay] = useState<string[]>(titleChars)
  const displayRef = useRef<string[]>(display)

  useEffect(() => {
    displayRef.current = display
  }, [display])

  useEffect(() => {
    const characters = Array.from(title)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplay(characters)
      setRevealed(characters.map(() => true))
      return
    }

    setDisplay(characters)
    setRevealed(characters.map(() => false))

    const total = Math.max(900, Math.min(2200, characters.length * 110 + 400))
    const windowMs = Math.min(350, Math.max(220, total * 0.3))
    const step = characters.length > 1 ? (total - windowMs) / (characters.length - 1) : 0
    let frame: number | null = null
    let startedAt: number | null = null

    const tick = (now: number) => {
      if (!startedAt) startedAt = now
      const elapsed = now - startedAt
      const nextDisplay = characters.map((character, index) => {
        if (character === ' ') return ' '

        const revealAt = index * step + windowMs
        if (elapsed >= revealAt) return character
        if (elapsed < index * step) return randomSymbol()

        const previous = displayRef.current[index]
        return shouldFlip((elapsed - index * step) / windowMs) ? randomSymbol() : (previous ?? randomSymbol())
      })

      setDisplay(nextDisplay)
      setRevealed(characters.map((character, index) => character === ' ' || elapsed >= index * step + windowMs))

      if (elapsed < total) {
        frame = requestAnimationFrame(tick)
      } else {
        setDisplay(characters)
        setRevealed(characters.map(() => true))
      }
    }

    frame = requestAnimationFrame(tick)
    return () => {
      if (frame) cancelAnimationFrame(frame)
    }
  }, [title])

  return (
    <h1
      aria-label={title}
      className={className}
      style={{
        fontFamily: 'Roboto, sans-serif',
        fontWeight: 700,
        fontSize: 'clamp(3rem, 10vw, 6rem)',
        letterSpacing: titleChars.length > 12 ? '0.06em' : '0.18em',
        color: '#ffffff',
        maxWidth: 'min(94vw, 22ch)',
        overflowWrap: 'anywhere',
        textAlign: 'center',
        ...style,
      }}
    >
      {display.map((character, index) => (
        <span
          aria-hidden="true"
          key={index}
          style={{
            display: 'inline-block',
            minWidth: character === ' ' ? '0.32em' : '0.6em',
            textAlign: 'center',
            color: revealed[index] ? '#ffffff' : 'rgba(255,255,255,0.45)',
            transition: revealed[index] ? 'color 0.35s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          }}
        >
          {character}
        </span>
      ))}
    </h1>
  )
}

export const HeroSubtitleReveal: React.FC<{
  style?: React.CSSProperties
}> = ({ style }) => {
  const [display, setDisplay] = useState(SUBTITLE_TEXT)
  const displayRef = useRef(display)

  useEffect(() => {
    displayRef.current = display
  }, [display])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(SUBTITLE_TEXT)
      return
    }

    let frame: number | null = null
    let startedAt: number | null = null
    const delay = 150
    const total = 1100

    const tick = (now: number) => {
      if (!startedAt) startedAt = now
      const elapsed = now - startedAt - delay

      if (elapsed < 0) {
        setDisplay(SUBTITLE_CHARS.map((character) => character === ' ' ? ' ' : randomSymbol()).join(''))
        frame = requestAnimationFrame(tick)
        return
      }

      const progress = Math.min(elapsed / total, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      const revealedCount = Math.floor(eased * SUBTITLE_CHARS.length)
      const previous = Array.from(displayRef.current)
      setDisplay(SUBTITLE_CHARS.map((character, index) => {
        if (index < revealedCount || character === ' ') return character
        const characterProgress = Math.max(0, (eased * SUBTITLE_CHARS.length - index) / 3)
        return shouldFlip(Math.min(characterProgress, 1)) ? randomSymbol() : (previous[index] ?? randomSymbol())
      }).join(''))

      if (progress < 1) frame = requestAnimationFrame(tick)
      else setDisplay(SUBTITLE_TEXT)
    }

    frame = requestAnimationFrame(tick)
    return () => {
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

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

export const HeroLogoReveal: React.FC<{
  src: string
  alt: string
  style?: React.CSSProperties
}> = ({ src, alt, style }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMounted(true)
      return
    }

    const timeout = window.setTimeout(() => setMounted(true), 40)
    return () => window.clearTimeout(timeout)
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
        transition: 'transform 0.6s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.45s ease-out',
        ...style,
      }}
    />
  )
}
