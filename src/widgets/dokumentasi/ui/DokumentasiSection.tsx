'use client'
import React, { useState } from 'react'

export const DokumentasiSection = ({ photos = [] }: { photos?: Array<{url: string, judul: string, kategori: string}> }) => {
  const [startIndex, setStartIndex] = useState(0)

  const handleNext = () => {
    if (photos.length > 3) {
      setStartIndex((prev) => (prev + 1) % photos.length)
    }
  }

  const handlePrev = () => {
    if (photos.length > 3) {
      setStartIndex((prev) => (prev - 1 + photos.length) % photos.length)
    }
  }

  const visiblePhotos = photos.length > 3 
    ? [
        photos[startIndex],
        photos[(startIndex + 1) % photos.length],
        photos[(startIndex + 2) % photos.length]
      ]
    : photos;

  return (
    <section className="relative w-full pt-10 pb-20 overflow-hidden" style={{ fontFamily: 'Poppins' }}>
      <style>{`
        @keyframes subtleBreathe {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.03); opacity: 1; }
        }
        .idle-animate {
          animation: subtleBreathe 6s ease-in-out infinite;
        }
        .group:hover .idle-animate {
          animation: none;
        }
      `}</style>

      <div className="max-w-[1440px] mx-auto px-4 md:px-10 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-[#142B42] text-[32px] md:text-[40px] font-bold leading-tight mb-2">
              Dokumentasi Kegiatan
            </h2>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full">
          
          {/* Left Arrow - Hanya muncul jika lebih dari 3 foto */}
          {photos.length > 3 && (
            <button onClick={handlePrev} className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-[45px] h-[45px] rounded-full bg-[#F7921C] hover:bg-[#e08316] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 hidden md:flex">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}

          {/* Cards Grid */}
          <div className={`grid grid-cols-1 gap-6 md:gap-8 mx-auto ${photos.length === 1 ? 'max-w-[486px]' : photos.length === 2 ? 'md:grid-cols-2 max-w-[800px]' : 'md:grid-cols-3'}`}>
            {photos.length > 0 ? visiblePhotos.map((foto, idx) => (
              <div key={`${startIndex}-${idx}`} className="relative flex flex-col items-center justify-center bg-[#F8FAFD] rounded-[32px] p-3 hover:shadow-xl transition-all duration-300 group cursor-pointer w-full h-[400px] md:h-[486px]">
                <div className="w-full h-full rounded-[30px] overflow-hidden relative">
                  <img src={foto?.url} alt={foto?.judul} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 idle-animate" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                  <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-[#F7921C] text-white text-[12px] font-bold px-3 py-1 rounded-full mb-2 inline-block">{foto?.kategori}</span>
                    <h3 className="text-white font-bold text-[18px] leading-tight">{foto?.judul}</h3>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-400 p-10">Belum ada dokumentasi tersedia.</div>
            )}
          </div>

          {/* Right Arrow - Hanya muncul jika lebih dari 3 foto */}
          {photos.length > 3 && (
            <button onClick={handleNext} className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-[45px] h-[45px] rounded-full bg-[#F7921C] hover:bg-[#e08316] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 hidden md:flex">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
