'use client'

import { PihakTerkaitItem, CustomFieldItem } from '@/entities/jurnal/model/submission-schema'

interface PihakTerkaitProps {
  value: PihakTerkaitItem[]
  onChange: (val: PihakTerkaitItem[]) => void
}

export function PihakTerkaitInput({ value, onChange }: PihakTerkaitProps) {
  const addRow = () => onChange([...value, { nama: '', instansi: '' }])
  const removeRow = (index: number) => onChange(value.filter((_, i) => i !== index))
  
  const updateRow = (index: number, key: keyof PihakTerkaitItem, val: string) => {
    const newVal = [...value]
    newVal[index] = { ...newVal[index], [key]: val }
    onChange(newVal)
  }

  return (
    <div className="space-y-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)]">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] tracking-widest uppercase">
          🤝 Pihak Terkait
        </label>
        <button
          type="button"
          onClick={addRow}
          className="px-3 py-1 text-xs rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-colors"
        >
          + Tambah Pihak
        </button>
      </div>
      
      {value.length > 0 && (
        <div className="space-y-3 mt-4">
          {value.map((item, i) => (
            <div key={i} className="flex gap-3 items-start bg-[var(--color-surface-raised)] p-2.5 rounded-lg border border-[var(--color-border-subtle)]">
              <input
                type="text"
                placeholder="Nama Pihak/Tokoh"
                value={item.nama}
                onChange={(e) => updateRow(i, 'nama', e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-b border-[var(--color-border-subtle)] px-2 py-1 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-ember-bright)]"
              />
              <input
                type="text"
                placeholder="Instansi (Opsional)"
                value={item.instansi || ''}
                onChange={(e) => updateRow(i, 'instansi', e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-b border-[var(--color-border-subtle)] px-2 py-1 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-ember-bright)]"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-red-500 hover:text-red-600 px-2 py-1 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface CustomFieldsProps {
  value: CustomFieldItem[]
  onChange: (val: CustomFieldItem[]) => void
}

export function CustomFieldsInput({ value, onChange }: CustomFieldsProps) {
  const addRow = () => onChange([...value, { label: '', value: '' }])
  const removeRow = (index: number) => onChange(value.filter((_, i) => i !== index))
  
  const updateRow = (index: number, key: keyof CustomFieldItem, val: string) => {
    const newVal = [...value]
    newVal[index] = { ...newVal[index], [key]: val }
    onChange(newVal)
  }

  return (
    <div className="space-y-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)]">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] tracking-widest uppercase">
          ✏️ Informasi Tambahan (Custom Fields)
        </label>
        <button
          type="button"
          onClick={addRow}
          className="px-3 py-1 text-xs rounded-lg border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-colors"
        >
          + Tambah Field
        </button>
      </div>
      
      {value.length > 0 && (
        <div className="space-y-3 mt-4">
          {value.map((item, i) => (
            <div key={i} className="flex gap-3 items-start bg-[var(--color-surface-raised)] p-2.5 rounded-lg border border-[var(--color-border-subtle)]">
              <input
                type="text"
                placeholder="Label (mis. Lokasi Detail)"
                value={item.label}
                onChange={(e) => updateRow(i, 'label', e.target.value)}
                className="flex-[0.4] min-w-0 bg-transparent border-b border-[var(--color-border-subtle)] px-2 py-1 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-ember-bright)]"
              />
              <input
                type="text"
                placeholder="Isi / Nilai"
                value={item.value}
                onChange={(e) => updateRow(i, 'value', e.target.value)}
                className="flex-[0.6] min-w-0 bg-transparent border-b border-[var(--color-border-subtle)] px-2 py-1 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-ember-bright)]"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-red-500 hover:text-red-600 px-2 py-1 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
