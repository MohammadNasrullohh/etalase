'use client'

import React, { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const [localVal, setLocalVal] = useState(value)

  useEffect(() => {
    setLocalVal(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLocalVal(val)
    onChange(val)
  }

  const handleClear = () => {
    setLocalVal('')
    onChange('')
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
      <input
        type="text"
        value={localVal}
        onChange={handleChange}
        placeholder="Cari jurnal..."
        className="w-full pl-9 pr-8 py-1.5 text-xs text-[var(--color-text-primary)] bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-full focus:outline-none focus:border-[var(--color-accent-focus)] transition-colors placeholder:text-[var(--color-text-muted)]"
      />
      {localVal && (
        <button 
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
