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
      mou:       { background: '#EBF7ED', color: '#1B6E37', border: '1px solid #C4E8CB' },
      audiensi:  { background: '#EDF5FB', color: '#195B8B', border: '1px solid #C4DFE8' },
      pelaporan: { background: '#FDF5E6', color: '#8A5E14', border: '1px solid #F0DDB8' },
      sengketa:  { background: '#FDF0EC', color: '#9E3B14', border: '1px solid #F2C9B8' },
      lainnya:   { background: '#F4F0E6', color: '#595045', border: '1px solid #D8CFB8' },
    }
    if (styleMap[normalized]) return styleMap[normalized]

    return {
      background: '#FDF5E6',
      color: '#8A5E14',
      border: '1px solid #F0DDB8',
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
