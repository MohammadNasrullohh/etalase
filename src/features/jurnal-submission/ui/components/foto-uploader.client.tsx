'use client'

import { useState } from 'react'
import { DokumentasiItem } from '@/entities/jurnal/model/submission-schema'
import { uploadFotoAction } from '@/entities/jurnal/api/upload-media.action'

interface Props {
  value: DokumentasiItem[]
  onChange: (value: DokumentasiItem[]) => void
}

export function FotoUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploading(true)
    setError(null)
    const file = e.target.files[0]

    // Reset input
    e.target.value = ''

    const formData = new FormData()
    formData.append('file', file)

    const res = await uploadFotoAction(formData)
    if (res.success && res.data?.url) {
      onChange([...value, { url: res.data.object_name, type: 'image', caption: '' }])
    } else {
      setError(res.error || 'Gagal mengunggah foto')
    }
    
    setUploading(false)
  }

  const updateCaption = (index: number, caption: string) => {
    const newVal = [...value]
    newVal[index] = { ...newVal[index], caption }
    onChange(newVal)
  }

  const removeFoto = (index: number) => {
    const newVal = value.filter((_, i) => i !== index)
    onChange(newVal)
  }

  return (
    <div className="space-y-4 p-4 rounded-xl glass-subtle border border-white/5">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-white/70 tracking-widest uppercase">
          📸 Foto Dokumentasi (Opsional)
        </label>
        <div>
          <label className={`cursor-pointer px-4 py-2 text-sm rounded-lg border border-white/10 hover:bg-white/5 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? 'Mengunggah...' : '+ Tambah Foto'}
            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} disabled={uploading} />
          </label>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {value.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {value.map((item, index) => (
            <div key={index} className="flex gap-4 p-3 rounded-lg bg-black/20 border border-white/5">
              <div className="w-16 h-16 bg-white/10 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                 <span className="text-xs text-white/50">IMG</span>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Keterangan foto (caption)..."
                  value={item.caption || ''}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 px-0 py-1 text-sm text-white focus:outline-none focus:border-[var(--color-ember-bright)]"
                />
                <button
                  type="button"
                  onClick={() => removeFoto(index)}
                  className="text-xs text-red-400 hover:text-red-300 self-start"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
