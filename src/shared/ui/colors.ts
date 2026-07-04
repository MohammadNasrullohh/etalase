import React from 'react'

export const ACCENT_COLORS = {
  violet: '#8B5CF6',
  cyan:   '#06B6D4',
  amber:  '#F59E0B',
  ember:  '#F2613F',
} as const

export const CATEGORY_COLORS = new Proxy<Record<string, string>>({}, {
  get: (target, prop) => {
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
  get: (target, prop) => {
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
  get: (target, prop) => {
    if (typeof prop !== 'string') return undefined
    const normalized = prop.toLowerCase()
    const styleMap: Record<string, React.CSSProperties> = {
      mou:       { background: 'rgba(139, 92, 246, 0.10)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.20)' },
      audiensi:  { background: 'rgba(6, 182, 212, 0.10)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.20)' },
      pelaporan: { background: 'rgba(245, 158, 11, 0.10)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.20)' },
      sengketa:  { background: 'rgba(242, 97, 63, 0.10)', color: '#ff7e60', border: '1px solid rgba(242, 97, 63, 0.20)' },
      lainnya:   { background: 'rgba(139, 92, 246, 0.10)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.20)' },
    }
    if (styleMap[normalized]) return styleMap[normalized]

    const color = CATEGORY_COLORS[normalized]
    return {
      background: `${color}1A`, // 10% opacity
      color: color,             // Bright accent text
      border: `1px solid ${color}33`, // 20% opacity border
    }
  }
})

export function getCategoryLabel(kategori: string): string {
  if (!kategori) return ''
  return CATEGORY_LABELS[kategori.toLowerCase()]
}

export function getCategoryColor(kategori: string): string {
  if (!kategori) return '#8B5CF6'
  return CATEGORY_COLORS[kategori.toLowerCase()]
}

export function getCategoryStyle(kategori: string): React.CSSProperties {
  if (!kategori) return CATEGORY_STYLES.lainnya
  return CATEGORY_STYLES[kategori.toLowerCase()]
}
