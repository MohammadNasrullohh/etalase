'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, ExternalLink, FileText } from 'lucide-react'
import { getCategoryColor, getCategoryLabel } from '@/shared/ui/colors'

interface JurnalDetailModalProps {
  id: string | null
  isOpen: boolean
  onClose: () => void
}

export const JurnalDetailModal: React.FC<JurnalDetailModalProps> = ({ id, isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['jurnal-detail', id],
    queryFn: () => {
      if (!id) return null
      return fetch(`/api/jurnal/${id}`).then(r => {
        if (!r.ok) throw new Error('Failed to fetch detail')
        return r.json()
      })
    },
    enabled: isOpen && !!id,
  })

  if (!isOpen) return null

  const item = response?.data



  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
        return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`
      }
      return dateStr
    } catch {
      return dateStr
    }
  }

  const kategoriColor = item ? getCategoryColor(item.kategori) : '#8B5CF6'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container — dark theme */}
      <div
        className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-lg shadow-2xl z-10 animate-scale-in"
        style={{
          background: 'linear-gradient(135deg, #0F0F16 0%, #0C0C12 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.08) transparent',
        }}
      >
        {/* Top accent line in kategori color */}
        {item && (
          <div
            className="absolute top-0 inset-x-0 h-[2px] rounded-t-lg"
            style={{ background: `linear-gradient(90deg, ${kategoriColor}, transparent)` }}
          />
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full transition-colors z-20"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {isLoading ? (
            <div className="py-12 text-center text-white/30 font-mono text-sm">Memuat data...</div>
          ) : error || !item ? (
            <div className="py-12 text-center text-red-400 font-mono text-sm">
              {error ? (error as Error).message : 'Data tidak ditemukan'}
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="mb-6">
                <span
                  className="inline-block px-2.5 py-0.5 text-[10px] font-mono font-semibold rounded mb-3 uppercase tracking-widest"
                  style={{ background: `${kategoriColor}22`, color: kategoriColor, border: `1px solid ${kategoriColor}44` }}
                >
                  {getCategoryLabel(item.kategori)}
                </span>
                <h2 className="text-xl md:text-2xl font-bold leading-tight mb-2 pr-8 text-white">
                  {item.judul}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 font-mono text-xs text-white/30">
                  <span>{formatDate(item.tanggal_kegiatan)}</span>
                  {item.redaksi && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      Redaksi: {item.redaksi}
                    </span>
                  )}
                </div>
                {Array.isArray(item.tags) && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.tags.map((t: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Link Publikasi */}
              {item.link_publikasi && (
                <a
                  href={item.link_publikasi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 mb-6 text-sm font-medium rounded transition-all"
                  style={{
                    border: `1px solid ${kategoriColor}66`,
                    color: kategoriColor,
                    background: `${kategoriColor}11`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${kategoriColor}22`)}
                  onMouseLeave={e => (e.currentTarget.style.background = `${kategoriColor}11`)}
                >
                  Lihat Artikel Resmi <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {/* Pihak Terkait */}
              {item.pihak_terkait && item.pihak_terkait.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-2">Pihak Terkait:</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.pihak_terkait.map((p: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-mono rounded"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }}
                      >
                        {p.nama} {p.instansi ? `(${p.instansi})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dokumentasi Media */}
              {item.dokumentasi && item.dokumentasi.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-3">Dokumentasi Media:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {item.dokumentasi.map((m: any, idx: number) => {
                      if (m.type === 'video') {
                        return (
                          <div key={idx} className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                            <video src={m.url} className="w-full h-full object-cover" controls />
                          </div>
                        )
                      }
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedImage(m.url)}
                          className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <img
                            src={m.url}
                            alt={m.caption || item.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {m.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[10px] p-1.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                              {m.caption}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Dokumen Pendukung */}
              {item.dokumen_pendukung && item.dokumen_pendukung.length > 0 && (
                <div className="mb-8 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-3">Dokumen Pendukung Resmi (Read-Only):</h4>
                  <div className="space-y-2">
                    {item.dokumen_pendukung.map((doc: any, idx: number) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2.5 rounded-lg transition-colors group"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <FileText className="w-5 h-5 flex-shrink-0" style={{ color: kategoriColor }} />
                        <div className="flex-grow min-w-0">
                          <div className="text-sm font-medium text-white/80 truncate">{doc.nama}</div>
                          <div className="text-[10px] font-mono text-white/25 uppercase">{doc.tipe} Document</div>
                        </div>
                        <ExternalLink className="w-4 h-4 flex-shrink-0 text-white/20" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Fields */}
              {item.custom_fields && item.custom_fields.length > 0 && (
                <div className="border-t pt-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-3">Metadata Tambahan:</h4>
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      {item.custom_fields.map((f: any, idx: number) => (
                        <tr key={idx} className="border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                          <td className="py-2.5 font-mono text-xs text-white/25 w-1/3">{f.label}</td>
                          <td className="py-2.5 font-medium text-white/70">{f.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full text-white"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Enlarged"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  )
}
export default JurnalDetailModal
