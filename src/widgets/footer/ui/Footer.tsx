import React from 'react'

export const Footer = () => {
  return (
    <footer className="w-full relative z-10 pt-16 mt-12 bg-transparent" style={{ fontFamily: 'Poppins' }}>

      <div className="max-w-[1440px] mx-auto px-4 md:px-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Column 1: Logo & Description */}
          <div className="flex flex-col pr-4">
            <div className="mb-4">
              <img src="/assets/hero-logo-etalase.png" alt="ETALASE Logo" className="h-[40px] md:h-[50px] object-contain" />
            </div>
            <h3 className="text-[#142B42] text-[16px] font-bold mb-4">
              Arsip Jurnal Bawaslu Kebumen
            </h3>
            <p className="text-[#5D6A77] text-[13px] leading-relaxed text-justify">
              platform digital terintegrasi milik Bawaslu Kabupaten Kebumen yang digunakan untuk mengelola arsip, artikel, serta informasi kegiatan secara transparan dan mudah diakses.
            </p>
          </div>

          {/* Column 2: Navigasi */}
          <div className="flex flex-col">
            <h3 className="text-[#142B42] text-[16px] font-bold mb-2">Navigasi</h3>
            <div className="w-8 h-[3px] bg-[#F7921C] mb-6"></div>
            <ul className="flex flex-col gap-4">
              <li><a href="/" className="text-[#5D6A77] text-[13px] hover:text-[#F7921C] transition-colors font-medium">Beranda</a></li>
              <li><a href="/#section-kalender" className="text-[#5D6A77] text-[13px] hover:text-[#F7921C] transition-colors font-medium">E-Kalender</a></li>
              <li><a href="/#section-arsip" className="text-[#5D6A77] text-[13px] hover:text-[#F7921C] transition-colors font-medium">Jurnal</a></li>
            </ul>
          </div>

          {/* Column 3: Tautan Cepat */}
          <div className="flex flex-col">
            <h3 className="text-[#142B42] text-[16px] font-bold mb-2">Tautan Cepat</h3>
            <div className="w-8 h-[3px] bg-[#F7921C] mb-6"></div>
            <ul className="flex flex-col gap-4">
              <li><a href="https://kebumen.bawaslu.go.id/profil" target="_blank" rel="noopener noreferrer" className="text-[#5D6A77] text-[13px] hover:text-[#F7921C] transition-colors font-medium">Profil Bawaslu Kebumen</a></li>
              <li><a href="https://kebumen.bawaslu.go.id/layanan-informasi-publik" target="_blank" rel="noopener noreferrer" className="text-[#5D6A77] text-[13px] hover:text-[#F7921C] transition-colors font-medium">Layanan Informasi Publik</a></li>
              <li><a href="https://ppid.bawaslu.go.id/" target="_blank" rel="noopener noreferrer" className="text-[#5D6A77] text-[13px] hover:text-[#F7921C] transition-colors font-medium">PPID Bawaslu</a></li>
              <li><a href="https://kebumen.bawaslu.go.id/kontak" target="_blank" rel="noopener noreferrer" className="text-[#5D6A77] text-[13px] hover:text-[#F7921C] transition-colors font-medium">Kontak Kami</a></li>
            </ul>
          </div>

          {/* Column 4: Hubungi Kami */}
          <div className="flex flex-col">
            <h3 className="text-[#142B42] text-[16px] font-bold mb-2">Hubungi Kami</h3>
            <div className="w-8 h-[3px] bg-[#F7921C] mb-6"></div>
            <ul className="flex flex-col gap-5">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-[#142B42] mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span className="text-[#5D6A77] text-[13px] font-medium leading-relaxed">
                  Jl. Tentara Pelajar No.21, Panggel, Panjer, Kec. Kebumen, Kabupaten Kebumen, Jawa Tengah 54312
                </span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-[#142B42] mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span className="text-[#5D6A77] text-[13px] font-medium">0287-3881185</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-[#142B42] mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span className="text-[#5D6A77] text-[13px] font-medium">set.kebumen@bawaslu.go.id</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Dark Section */}
      <div className="w-full bg-[#34414C] py-10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/70 text-[13px] font-medium">
            &copy; {new Date().getFullYear()} Bawaslu Kabupaten Kebumen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
