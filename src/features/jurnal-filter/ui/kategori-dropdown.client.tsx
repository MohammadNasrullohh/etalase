'use client'

import React from 'react'

interface KategoriDropdownProps {
  value: string
  onChange: (val: string) => void
}

const categories = [
  { val: '', label: 'Semua Kategori' },
  { val: 'mou', label: 'MoU' },
  { val: 'sengketa', label: 'Sengketa' },
  { val: 'audiensi', label: 'Audiensi' },
  { val: 'pelaporan', label: 'Pelaporan' },
  { val: 'lainnya', label: 'Lainnya' }
]

export const KategoriDropdown: React.FC<KategoriDropdownProps> = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 text-xs rounded-full bg-[var(--color-ember-deep)] text-[#E2D7D0] border border-[var(--color-ember-mid)]/50 focus:outline-none focus:border-[var(--color-ember-bright)] cursor-pointer select-none transition-colors"
    >
      {categories.map((c) => (
        <option key={c.val} value={c.val} className="bg-[var(--color-ember-deep)] text-white">
          {c.label}
        </option>
      ))}
    </select>
  )
}
export default KategoriDropdown
