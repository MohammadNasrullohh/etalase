'use client'

import { useState, useRef } from 'react'
import { DokumenPendukungItem } from '@/entities/jurnal/model/submission-schema'
import { uploadDokumenAction } from '@/entities/jurnal/api/upload-media.action'

interface Props {
  value: DokumenPendukungItem[]
  onChange: (value: DokumenPendukungItem[]) => void
}

export function DokumenUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const namaDokumen = prompt('Masukkan nama dokumen (mis. Surat Tugas, Notulen):', file.name)
    
    if (!namaDokumen) {
       e.target.value = ''
       return
    }

    setUploading(true)
    setError(null)
    
    // Reset input
    e.target.value = ''

    const formData = new FormData()
    formData.append('file', file)
    formData.append('nama', namaDokumen)

    const res = await uploadDokumenAction(formData)
    if (res.success && res.data?.url) {
      onChange([...value, { nama: namaDokumen, url: res.data.object_name, tipe: 'pdf', is_public: true }])
    } else {
      setError(res.error || 'Gagal mengunggah dokumen')
    }
    
    setUploading(false)
  }

  const removeDokumen = (index: number) => {
    const newVal = value.filter((_, i) => i !== index)
    onChange(newVal)
  }

  return (
    <div className="space-y-4 p-4 rounded-xl glass-subtle border border-white/5">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-white/70 tracking-widest uppercase">
          📄 Dokumen Pendukung (PDF)
        </label>
        <div>
          <label className={`cursor-pointer px-4 py-2 text-sm rounded-lg border border-white/10 hover:bg-white/5 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? 'Mengunggah...' : '+ Tambah Dokumen'}
            <input type="file" className="hidden" accept="application/pdf" onChange={handleFileSelect} disabled={uploading} ref={fileInputRef} />
          </label>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {value.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {value.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/5">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-xl">📑</span>
                <div className="truncate">
                  <p className="text-sm font-medium text-white/90 truncate">{item.nama}</p>
                  <p className="text-xs text-white/40">PDF Document</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeDokumen(index)}
                className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
