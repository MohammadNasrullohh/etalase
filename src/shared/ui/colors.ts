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
    const normalized = prop.toLowerCase().trim()
    const colorMap: Record<string, string> = {
      'penanganan pelanggaran': ACCENT_COLORS.ember,
      'penyelesaian sengketa':  ACCENT_COLORS.cyan,
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
    const normalized = prop.toLowerCase().trim()
    const labelMap: Record<string, string> = {
      'penanganan pelanggaran': 'Penanganan Pelanggaran',
      'penyelesaian sengketa':  'Penyelesaian Sengketa',
    }
    if (labelMap[normalized]) return labelMap[normalized]
    
    // Capitalize words
    return prop.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }
})

export const CATEGORY_STYLES = new Proxy<Record<string, React.CSSProperties>>({}, {
  get: (_target, prop) => {
    if (typeof prop !== 'string') return undefined
    const normalized = prop.toLowerCase().trim()
    const styleMap: Record<string, React.CSSProperties> = {
      'penanganan pelanggaran':  { background: '#FDF0EC', color: '#9E3B14', border: '1px solid #F2C9B8' },
      'penyelesaian sengketa':  { background: '#EDF5FB', color: '#195B8B', border: '1px solid #C4DFE8' },
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
  return CATEGORY_LABELS[kategori.toLowerCase().trim()]
}

export function getCategoryColor(kategori: string): string {
  if (!kategori) return ACCENT_COLORS.violet
  return CATEGORY_COLORS[kategori.toLowerCase().trim()]
}

export function getCategoryStyle(kategori: string): React.CSSProperties {
  if (!kategori) return CATEGORY_STYLES['penanganan pelanggaran']
  return CATEGORY_STYLES[kategori.toLowerCase().trim()]
}
