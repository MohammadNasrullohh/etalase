'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, ExternalLink, FileText } from 'lucide-react'

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-[#F9F4F1] text-neutral-900 rounded-sm shadow-2xl z-10 border border-neutral-200 p-6 md:p-8 animate-scale-in">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="py-12 text-center text-neutral-500 font-mono">Loading data...</div>
        ) : error || !item ? (
          <div className="py-12 text-center text-red-600 font-mono">Error: {error ? (error as Error).message : 'Not found'}</div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--color-ember-mid)] text-[#F9F4F1] mb-2 uppercase tracking-wide">
                {item.kategori}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2 pr-8 text-neutral-900">
                {item.judul}
              </h2>
              <div className="font-mono text-xs text-neutral-500">
                {formatDate(item.tanggal_kegiatan)}
              </div>
            </div>

            {/* Link Publikasi */}
            {item.link_publikasi && (
              <a 
                href={item.link_publikasi}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 mb-6 text-sm font-medium rounded-sm border border-[var(--color-ember-bright)] text-[var(--color-ember-bright)] hover:bg-[var(--color-ember-bright)] hover:text-white transition-colors"
              >
                Lihat Artikel Resmi <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Pihak Terkait */}
            {item.pihak_terkait && item.pihak_terkait.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-mono uppercase text-neutral-500 mb-2">Pihak Terkait:</h4>
                <div className="flex flex-wrap gap-2">
                  {item.pihak_terkait.map((p: any, idx: number) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 text-xs font-medium rounded-sm bg-neutral-100 border border-neutral-200 text-neutral-800"
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
                <h4 className="text-xs font-mono uppercase text-neutral-500 mb-3">Dokumentasi Media:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {item.dokumentasi.map((m: any, idx: number) => {
                    if (m.type === 'video') {
                      return (
                        <div key={idx} className="relative aspect-[4/3] bg-black border border-neutral-200 rounded-sm overflow-hidden flex items-center justify-center group">
                          <video src={m.url} className="w-full h-full object-cover" controls />
                        </div>
                      )
                    }
                    return (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedImage(m.url)}
                        className="relative aspect-[4/3] bg-neutral-100 border border-neutral-200 rounded-sm overflow-hidden cursor-pointer group"
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
              <div className="mb-8 p-4 bg-neutral-50 border border-neutral-200 rounded-sm">
                <h4 className="text-xs font-mono uppercase text-neutral-500 mb-3">Dokumen Pendukung Resmi (Read-Only):</h4>
                <div className="space-y-2">
                  {item.dokumen_pendukung.map((doc: any, idx: number) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 rounded-sm hover:bg-neutral-100 border border-neutral-200/60 transition-colors group"
                    >
                      <FileText className="w-5 h-5 text-neutral-500 group-hover:text-[var(--color-ember-bright)] transition-colors" />
                      <div className="flex-grow">
                        <div className="text-sm font-semibold text-neutral-800">{doc.nama}</div>
                        <div className="text-[10px] font-mono text-neutral-400 uppercase">{doc.tipe} Document</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-neutral-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {item.custom_fields && item.custom_fields.length > 0 && (
              <div className="border-t border-neutral-200 pt-6">
                <h4 className="text-xs font-mono uppercase text-neutral-500 mb-3">Metadata Tambahan:</h4>
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {item.custom_fields.map((f: any, idx: number) => (
                      <tr key={idx} className="border-b border-neutral-100 last:border-0">
                        <td className="py-2.5 font-mono text-xs text-neutral-400 w-1/3">{f.label}</td>
                        <td className="py-2.5 font-medium text-neutral-800">{f.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-neutral-900/50 hover:bg-neutral-900 rounded-full text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={selectedImage} 
            alt="Enlarged" 
            className="max-w-full max-h-[90vh] object-contain rounded-sm"
          />
        </div>
      )}
    </div>
  )
}
export default JurnalDetailModal
