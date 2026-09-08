import { NextResponse } from 'next/server'

// Mock endpoint for Lawet Hub approval item detail in standalone mode
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id

  return NextResponse.json({
    id,
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
  })
}
