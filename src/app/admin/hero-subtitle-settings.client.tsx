'use client'

import { FormEvent, useState } from 'react'
import { Check, LoaderCircle, TextQuote } from 'lucide-react'
import { MAX_HERO_SUBTITLE_LENGTH } from '@/entities/site-settings/lib/hero-subtitle'

export function HeroSubtitleSettingsPanel({ initialSubtitle }: { initialSubtitle: string }) {
  const [subtitle, setSubtitle] = useState(initialSubtitle)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const saveSubtitle = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('saving')
    setMessage('Menyimpan subtitle hero…')

    try {
      const response = await fetch('/api/admin/hero', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtitle }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Gagal menyimpan subtitle hero.')
      setSubtitle(body.data.subtitle)
      setStatus('success')
      setMessage('Subtitle hero sudah diperbarui.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Gagal menyimpan subtitle hero.')
    }
  }

  return (
    <form onSubmit={saveSubtitle} className="mt-10 border-t border-[var(--glass-border-subtle)] pt-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="hero-subtitle" className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]">
            <TextQuote className="h-5 w-5 text-[var(--color-accent-hover)]" aria-hidden="true" />
            Subtitle hero
          </label>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">Teks ini tampil tepat di bawah judul besar pada beranda. Maksimum {MAX_HERO_SUBTITLE_LENGTH} karakter.</p>
          <input
            id="hero-subtitle"
            value={subtitle}
            onChange={(event) => {
              setSubtitle(event.target.value)
              setStatus('idle')
              setMessage('')
            }}
            maxLength={MAX_HERO_SUBTITLE_LENGTH}
            required
            className="mt-4 min-h-11 w-full rounded-lg border border-[var(--glass-border-default)] bg-[var(--color-surface-overlay)] px-3 text-base text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-muted)]/60 hover:border-[var(--color-accent-hover)] focus:border-[var(--color-accent-hover)] focus:ring-2 focus:ring-[color:var(--color-accent-hover)]/30 shadow-sm"
            aria-describedby="hero-subtitle-status"
          />
        </div>
        <button type="submit" disabled={status === 'saving'} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text-on-accent)] transition-colors hover:bg-[var(--color-accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-focus)] focus:ring-offset-2 focus:ring-offset-[var(--color-canvas-raised)] disabled:cursor-not-allowed disabled:opacity-55 shadow-sm">
          {status === 'saving' ? 'Menyimpan…' : 'Simpan subtitle'}
        </button>
      </div>
      {message && (
        <p id="hero-subtitle-status" role="status" className={`mt-3 flex items-center gap-2 text-sm ${status === 'error' ? 'text-red-700' : status === 'success' ? 'text-emerald-800' : 'text-[var(--color-text-muted)]'}`}>
          {status === 'saving' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : status === 'success' ? <Check className="h-4 w-4" /> : null}
          {message}
        </p>
      )}
    </form>
  )
}
