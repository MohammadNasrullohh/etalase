'use client'

import { useState } from 'react'
import { submitJurnalAction } from '@/entities/jurnal/api/submit-jurnal.action'
import { JurnalSubmissionPayload } from '@/entities/jurnal/model/submission-schema'
import { FileText, Calendar, Tag, Send, ArrowRight } from 'lucide-react'
import { FotoUploader } from './components/foto-uploader.client'
import { DokumenUploader } from './components/dokumen-uploader.client'
import { PihakTerkaitInput, CustomFieldsInput } from './components/dynamic-lists.client'

export function JurnalSubmitForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [payload, setPayload] = useState<JurnalSubmissionPayload>({
    judul: '',
    tanggal_kegiatan: '',
    kategori: 'sosialisasi',
    dokumentasi: [],
    dokumen_pendukung: [],
    pihak_terkait: [],
    custom_fields: [],
    tags: [],
    link_publikasi: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await submitJurnalAction(payload)
      if (res.success) {
        setSuccess(true)
        setPayload({ ...payload, judul: '', tags: [] })
      } else {
        setError(res.error || 'Gagal mengirim jurnal')
      }
    } catch (err: any) {
      setError(err.message || 'Koneksi terputus')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-surface p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden w-full max-w-3xl mx-auto">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-ember-bright)] to-transparent opacity-50" />
      
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white font-mono uppercase tracking-widest flex items-center gap-2">
          <FileText className="w-6 h-6 text-[var(--color-ember-bright)]" />
          Pengajuan Jurnal
        </h2>
        <p className="text-sm text-gray-400 mt-2">Isi form berikut untuk mengajukan jurnal ke sistem Lawet Hub.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border-l-2 border-red-500 text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border-l-2 border-green-500 text-green-400 text-sm font-mono">
          Jurnal berhasil diajukan dan sedang menunggu proses approval.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Judul */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Judul Jurnal *</label>
          <input
            type="text"
            required
            value={payload.judul}
            onChange={e => setPayload({ ...payload, judul: e.target.value })}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-ember-bright)] transition-colors"
            placeholder="Contoh: Rapat Koordinasi Bawaslu"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tanggal */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Tanggal Kegiatan *
            </label>
            <input
              type="date"
              required
              value={payload.tanggal_kegiatan}
              onChange={e => setPayload({ ...payload, tanggal_kegiatan: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-ember-bright)] transition-colors"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Kategori *</label>
            <select
              required
              value={payload.kategori}
              onChange={e => setPayload({ ...payload, kategori: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-ember-bright)] transition-colors appearance-none"
            >
              <option value="sosialisasi">Sosialisasi</option>
              <option value="rapat">Rapat</option>
              <option value="koordinasi">Koordinasi</option>
              <option value="pengawasan">Pengawasan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Tags (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={payload.tags.join(', ')}
              onChange={e => setPayload({ ...payload, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-ember-bright)] transition-colors"
              placeholder="pemilu, pengawasan, bawaslu"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono flex items-center gap-1.5">
              Link Publikasi Berita (Opsional)
            </label>
            <input
              type="url"
              value={payload.link_publikasi || ''}
              onChange={e => setPayload({ ...payload, link_publikasi: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-ember-bright)] transition-colors"
              placeholder="https://bawaslu.go.id/..."
            />
          </div>
        </div>

        <div className="space-y-6 pt-4 border-t border-white/10">
          <FotoUploader 
            value={payload.dokumentasi} 
            onChange={(val) => setPayload({ ...payload, dokumentasi: val })} 
          />
          <DokumenUploader 
            value={payload.dokumen_pendukung} 
            onChange={(val) => setPayload({ ...payload, dokumen_pendukung: val })} 
          />
          <PihakTerkaitInput 
            value={payload.pihak_terkait} 
            onChange={(val) => setPayload({ ...payload, pihak_terkait: val })} 
          />
          <CustomFieldsInput 
            value={payload.custom_fields} 
            onChange={(val) => setPayload({ ...payload, custom_fields: val })} 
          />
        </div>

        <div className="pt-6 border-t border-white/10">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-ember-bright)] text-black font-bold py-3.5 px-4 rounded-xl hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer font-mono text-sm uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" /> Ajukan Jurnal <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
