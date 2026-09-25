import { describe, expect, it } from 'vitest'
import { DEFAULT_HERO_SUBTITLE, MAX_HERO_SUBTITLE_LENGTH, normalizeHeroSubtitle } from '@/entities/site-settings/lib/hero-subtitle'

describe('hero subtitle settings', () => {
  it('uses the public archive name as the default subtitle', () => {
    expect(DEFAULT_HERO_SUBTITLE).toBe('Arsip Jurnal Bawaslu Kebumen')
  })

  it('normalizes whitespace and rejects invalid subtitles', () => {
    expect(normalizeHeroSubtitle('  Arsip   Kegiatan  ')).toBe('Arsip Kegiatan')
    expect(normalizeHeroSubtitle('  ')).toBeNull()
    expect(normalizeHeroSubtitle('A'.repeat(MAX_HERO_SUBTITLE_LENGTH + 1))).toBeNull()
  })
})
