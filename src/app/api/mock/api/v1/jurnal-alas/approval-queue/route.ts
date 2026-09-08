import { NextResponse } from 'next/server'

// Mock endpoint for Lawet Hub approval queue in standalone mode
export async function GET() {
  return NextResponse.json([
    {
      id: 'mock-jurnal-lawet-1',
      judul: 'Sosialisasi Pengawasan Pemilu Partisipatif dengan Tokoh Masyarakat',
      status: 'submitted',
      kategori: 'sosialisasi',
      created_by: 'Staf Humas (Mock)',
      divisi: 'Divisi Pengawasan & Humas',
      tanggal_kegiatan: '2026-08-15',
      redaksi: 'Staf Humas',
      dokumentasi: [
        {
          url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=60',
          caption: 'Pertemuan dengan tokoh masyarakat',
          type: 'image',
        },
      ],
      dokumen_pendukung: [
        {
          nama: 'Notulen Sosialisasi.pdf',
          url: 'https://media.domain.com/mock-notulen.pdf',
          tipe: 'pdf',
          is_public: true,
        },
      ],
      pihak_terkait: [{ nama: 'FKUB Kebumen', instansi: 'Tokoh Masyarakat' }],
      custom_fields: [{ label: 'Lokasi', value: 'Hotel Grand Kolopaking' }],
    },
    {
      id: 'mock-jurnal-lawet-2',
      judul: 'Rapat Koordinasi Pengawasan Logistik Tahap Pertama',
      status: 'submitted',
      kategori: 'audiensi',
      created_by: 'Staf Pengawasan (Mock)',
      divisi: 'Divisi Pengawasan & Humas',
      tanggal_kegiatan: '2026-08-18',
      redaksi: 'Staf Pengawasan',
      dokumentasi: [],
      dokumen_pendukung: [],
      pihak_terkait: [{ nama: 'KPU Kebumen', instansi: 'Penyelenggara Teknis' }],
      custom_fields: [{ label: 'Tempat', value: 'Kantor Bawaslu' }],
    },
  ])
}
