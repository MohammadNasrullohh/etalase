import React from 'react'
import { getCategoryLabel, getCategoryStyle } from '@/shared/ui/colors'

interface JurnalCardProps {
  id: string
  judul: string
  tanggal_kegiatan: string
  kategori: string
  thumbnail_url?: string | null
  ringkasan?: string | null
  pihak_terkait?: any[]
  tags?: any[]
  isActive?: boolean
  isLineTarget?: boolean
  onClick?: () => void
  onHover?: (id: string, date: string) => void
  onLeaveHover?: () => void
  staggerDelay?: string
}

export const JurnalCard: React.FC<JurnalCardProps> = ({
  id,
  judul,
  tanggal_kegiatan,
  kategori,
  thumbnail_url,
  ringkasan,
  pihak_terkait = [],
  tags = [],
  isActive = false,
  isLineTarget = false,
  onClick,
  onHover,
  onLeaveHover,
  staggerDelay = '0ms'
}) => {
  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
        const day = parts[2]
        const month = months[parseInt(parts[1], 10) - 1]
        const year = parts[0]
        return `${day} ${month} ${year}`
      }
      return dateStr
    } catch {
      return dateStr
    }
  }

  return (
    <div
      id={`jurnal-card-${id}`}
      data-tanggal={tanggal_kegiatan}
      className="jurnal-card relative group flex flex-col w-full max-w-[405px] h-auto mx-auto bg-[#FCFCFC] rounded-[26px] shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer outline-none"
      style={{
        animationDelay: staggerDelay,
        fontFamily: 'Poppins'
      }}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      onClick={onClick}
      onMouseEnter={() => onHover?.(id, tanggal_kegiatan)}
      onMouseLeave={() => onLeaveHover?.()}
    >
      <div className="relative">
        {/* Padded Container for Image */}
        <div className="pt-[35px] px-[35.5px] relative shrink-0">
          <div className="relative w-full h-[171px] rounded-[15px] overflow-hidden bg-gray-100">
            <img
              src={(thumbnail_url && (thumbnail_url.startsWith('http') || thumbnail_url.startsWith('/') || thumbnail_url.startsWith('data:'))) ? thumbnail_url : '/assets/banner-image.jpg'}
              alt={judul}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Badge Kategori - overlapping the image */}
          <div className="absolute -bottom-3 left-[25px] z-10 px-4 py-1.5 bg-[#F7921C] rounded-full text-white text-[11px] font-bold shadow-sm tracking-wide">
            {getCategoryLabel(kategori)}
          </div>
        </div>
      </div>

      <div className="px-[35.5px] pb-[35.5px] pt-6 flex flex-col flex-1 bg-transparent">
        <h3 className="text-[#142B42] text-[16px] font-bold leading-snug mb-2 line-clamp-2">
          {judul}
        </h3>

        <div className="text-[13px] text-[#5D6A77] line-clamp-3 mb-4 leading-relaxed flex-1" style={{ fontFamily: 'Poppins' }}>
          {ringkasan || 'Tidak ada ringkasan yang tersedia.'}
        </div>

        {/* Metadata (Date and Tags) */}
        <div className="flex flex-wrap items-center gap-4 mb-2" style={{ fontFamily: 'Poppins' }}>
          <span className="text-[#F7921C] text-[12px] font-semibold">{formatDate(tanggal_kegiatan)}</span>
          {tags && tags.length > 0 && (
            <div className="flex items-center gap-4">
              {tags.map((tag, idx) => (
                <span key={idx} className="text-[12px] text-[#5D6A77] font-medium">
                  #{typeof tag === 'object' && tag !== null ? (tag.nama || tag.name) : tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* "Lihat Detail" button */}
        <div className="flex justify-end mt-auto pt-1">
          <span className="text-[#346BFF] hover:text-[#1a4bd8] text-[13px] font-bold cursor-pointer transition-colors">
            Lihat Detail
          </span>
        </div>
      </div>
    </div>
  )
}
