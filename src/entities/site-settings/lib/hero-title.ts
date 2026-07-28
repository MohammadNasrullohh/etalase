export const DEFAULT_HERO_TITLE = 'ALAS'
export const MAX_HERO_TITLE_LENGTH = 60

export function normalizeHeroTitle(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const title = value.trim().replace(/\s+/g, ' ')
  const length = Array.from(title).length

  if (!title || length > MAX_HERO_TITLE_LENGTH) return null
  return title
}
