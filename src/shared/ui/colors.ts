import React from 'react'

export const ACCENT_COLORS = {
  violet: 'var(--color-category-violet)',
  cyan:   'var(--color-category-cyan)',
  amber:  'var(--color-category-amber)',
  ember:  'var(--color-accent)',
} as const

export const CATEGORY_COLORS = new Proxy<Record<string, string>>({}, {
  get: (_target, prop) => {
    if (typeof prop !== 'string') return undefined
    const normalized = prop.toLowerCase()
    const colorMap: Record<string, string> = {
      mou:       ACCENT_COLORS.violet,
      audiensi:  ACCENT_COLORS.cyan,
      pelaporan: ACCENT_COLORS.amber,
      sengketa:  ACCENT_COLORS.ember,
      lainnya:   ACCENT_COLORS.violet,
    }
    if (colorMap[normalized]) return colorMap[normalized]

    // Stable string hash mapped to the 4 accent colors
    const colors = [
      ACCENT_COLORS.violet,
      ACCENT_COLORS.cyan,
      ACCENT_COLORS.amber,
      ACCENT_COLORS.ember,
    ]
    let hash = 0
    for (let i = 0; i < normalized.length; i++) {
      hash = normalized.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }
})

export const CATEGORY_LABELS = new Proxy<Record<string, string>>({}, {
  get: (_target, prop) => {
    if (typeof prop !== 'string') return undefined
    const normalized = prop.toLowerCase()
    const labelMap: Record<string, string> = {
      mou:       'MoU',
      audiensi:  'Audiensi',
      pelaporan: 'Pelaporan',
      sengketa:  'Sengketa',
      lainnya:   'Lainnya',
    }
    if (labelMap[normalized]) return labelMap[normalized]
    return prop.charAt(0).toUpperCase() + prop.slice(1)
  }
})

export const CATEGORY_STYLES = new Proxy<Record<string, React.CSSProperties>>({}, {
  get: (_target, prop) => {
    if (typeof prop !== 'string') return undefined
    const normalized = prop.toLowerCase()
    const styleMap: Record<string, React.CSSProperties> = {
      mou:       { background: 'color-mix(in srgb, var(--color-category-violet) 10%, transparent)', color: 'var(--color-category-violet-text)', border: '1px solid color-mix(in srgb, var(--color-category-violet) 20%, transparent)' },
      audiensi:  { background: 'color-mix(in srgb, var(--color-category-cyan) 10%, transparent)', color: 'var(--color-category-cyan-text)', border: '1px solid color-mix(in srgb, var(--color-category-cyan) 20%, transparent)' },
      pelaporan: { background: 'color-mix(in srgb, var(--color-category-amber) 10%, transparent)', color: 'var(--color-category-amber-text)', border: '1px solid color-mix(in srgb, var(--color-category-amber) 20%, transparent)' },
      sengketa:  { background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-category-ember-text)', border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)' },
      lainnya:   { background: 'color-mix(in srgb, var(--color-category-violet) 10%, transparent)', color: 'var(--color-category-violet-text)', border: '1px solid color-mix(in srgb, var(--color-category-violet) 20%, transparent)' },
    }
    if (styleMap[normalized]) return styleMap[normalized]

    const color = CATEGORY_COLORS[normalized]
    return {
      background: `color-mix(in srgb, ${color} 10%, transparent)`,
      color,
      border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
    }
  }
})

export function getCategoryLabel(kategori: string): string {
  if (!kategori) return ''
  return CATEGORY_LABELS[kategori.toLowerCase()]
}

export function getCategoryColor(kategori: string): string {
  if (!kategori) return ACCENT_COLORS.violet
  return CATEGORY_COLORS[kategori.toLowerCase()]
}

export function getCategoryStyle(kategori: string): React.CSSProperties {
  if (!kategori) return CATEGORY_STYLES.lainnya
  return CATEGORY_STYLES[kategori.toLowerCase()]
}
