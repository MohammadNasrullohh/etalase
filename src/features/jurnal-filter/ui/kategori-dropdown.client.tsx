'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCategoryLabel } from '@/shared/ui/colors'

interface KategoriDropdownProps {
  value: string
  onChange: (val: string) => void
}

export const KategoriDropdown: React.FC<KategoriDropdownProps> = ({ value, onChange }) => {
  const { data: response } = useQuery({
    queryKey: ['categories-list'],
    queryFn: () => fetch('/api/jurnal/kategori').then(r => {
      if (!r.ok) throw new Error('Failed to fetch categories')
      return r.json()
    }),
    staleTime: 10 * 60 * 1000,
  })

  const dbCategories = response?.data || []
  
  const uniqueCategories = Array.from(new Set([
    'mou',
    'sengketa',
    'audiensi',
    'pelaporan',
    ...dbCategories.map((c: string) => c.toLowerCase())
  ]))

  const filteredCategories = uniqueCategories.filter(c => c !== 'lainnya')

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 text-xs rounded-full bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] focus:outline-none focus:border-[var(--color-accent-focus)] cursor-pointer select-none transition-colors"
    >
      <option value="" className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">Semua Kategori</option>
      {filteredCategories.map((cat) => {
        const label = getCategoryLabel(cat)
        return (
          <option key={cat} value={cat} className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">
            {label}
          </option>
        )
      })}
      <option value="lainnya" className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">Lainnya</option>
    </select>
  )
}
