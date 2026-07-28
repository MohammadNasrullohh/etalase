'use client'

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { Check, ImageUp, LoaderCircle, ShieldCheck } from 'lucide-react'

type Props = {
  initialImagePath: string
  initialUpdatedAt: string | null
}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

export function HeroSettingsPanel({ initialImagePath, initialUpdatedAt }: Props) {
  const [imagePath, setImagePath] = useState(initialImagePath)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null
    if (!selected) return
    if (selected.size > MAX_UPLOAD_BYTES) {
      setStatus('error')
      setMessage('Ukuran file maksimal 8 MB.')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(selected.type)) {
      setStatus('error')
      setMessage('Pilih file JPEG, PNG, WebP, atau AVIF.')
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setStatus('idle')
    setMessage('')
  }

  const upload = async (event: FormEvent) => {
    event.preventDefault()
    if (!file) {
      setStatus('error')
      setMessage('Pilih gambar sebelum menyimpan.')
      return
    }
    setStatus('uploading')
    setMessage('Mengonversi dan menyimpan gambar…')
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/admin/hero', { method: 'POST', body: formData })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Gagal menyimpan gambar.')
      setImagePath(`${body.data.imagePath}?v=${Date.now()}`)
      setFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setStatus('success')
      setMessage('Hero beranda sudah diperbarui.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Gagal menyimpan gambar.')
    }
  }

  const displayImage = previewUrl || imagePath
  const updatedLabel = initialUpdatedAt
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(initialUpdatedAt))
    : 'Menggunakan gambar bawaan'

  return (
    <section id="hero" className="mt-10 border-t border-white/10 pt-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_19rem] xl:items-start">
        <div>
          <div className="overflow-hidden rounded-xl bg-black">
            <img src={displayImage} alt="Pratinjau hero beranda" className="aspect-[16/9] w-full object-cover" />
          </div>
          <p className="mt-3 text-sm text-white/55">Terakhir diperbarui: {updatedLabel}</p>
        </div>

        <form onSubmit={upload} className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Ganti hero image</h2>
            <p className="mt-1 text-sm leading-6 text-white/60">Rasio 16:9 direkomendasikan. File sumber maksimum 8 MB.</p>
          </div>

          <input ref={fileInputRef} id="hero-image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={selectFile} className="sr-only" />
          <label htmlFor="hero-image" className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-5 text-center transition-colors hover:border-[#F2613F]/70 hover:bg-[#F2613F]/5">
            <ImageUp className="h-6 w-6 text-[#FF8A6C]" aria-hidden="true" />
            <span className="mt-3 text-sm font-medium text-white">{file ? file.name : 'Pilih gambar'}</span>
            <span className="mt-1 text-xs text-white/50">JPEG, PNG, WebP, atau AVIF</span>
          </label>

          <div className="rounded-lg bg-white/[0.03] p-4 text-sm text-white/65">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
              <p>Gambar divalidasi di server, orientasi diperbaiki, metadata dihapus, dan dikonversi ke WebP 1920 × 1080 (kualitas 82).</p>
            </div>
          </div>

          {message && (
            <p role="status" className={`flex items-center gap-2 text-sm ${status === 'error' ? 'text-red-300' : status === 'success' ? 'text-emerald-300' : 'text-white/65'}`}>
              {status === 'uploading' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : status === 'success' ? <Check className="h-4 w-4" /> : null}
              {message}
            </p>
          )}

          <button type="submit" disabled={status === 'uploading'} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#F2613F] px-4 py-2.5 text-sm font-semibold text-[#25100A] transition-colors hover:bg-[#FF8A6C] focus:outline-none focus:ring-2 focus:ring-[#FFB6A4] focus:ring-offset-2 focus:ring-offset-[#090A0D] disabled:cursor-not-allowed disabled:opacity-55">
            {status === 'uploading' ? 'Memproses…' : 'Simpan gambar hero'}
          </button>
        </form>
      </div>
    </section>
  )
}
