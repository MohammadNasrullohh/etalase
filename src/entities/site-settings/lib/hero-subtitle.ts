export const DEFAULT_HERO_SUBTITLE = 'Arsip Langkah Bawaslu Kebumen'
export const MAX_HERO_SUBTITLE_LENGTH = 100

export function normalizeHeroSubtitle(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const subtitle = value.trim().replace(/\s+/g, ' ')
  const length = Array.from(subtitle).length

  if (!subtitle || length > MAX_HERO_SUBTITLE_LENGTH) return null
  return subtitle
}
