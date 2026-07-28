import { describe, expect, it } from 'vitest'
import { DEFAULT_HERO_TITLE, MAX_HERO_TITLE_LENGTH, normalizeHeroTitle } from '@/entities/site-settings/lib/hero-title'

describe('hero title settings', () => {
  it('uses ALAS as the default title', () => {
    expect(DEFAULT_HERO_TITLE).toBe('ALAS')
  })

  it('trims the title and normalizes internal whitespace before saving', () => {
    expect(normalizeHeroTitle('  Ruang   Aspirasi  ')).toBe('Ruang Aspirasi')
  })

  it('rejects empty, non-text, and overlong titles', () => {
    expect(normalizeHeroTitle('   ')).toBeNull()
    expect(normalizeHeroTitle({ title: 'ALAS' })).toBeNull()
    expect(normalizeHeroTitle('A'.repeat(MAX_HERO_TITLE_LENGTH + 1))).toBeNull()
  })
})
