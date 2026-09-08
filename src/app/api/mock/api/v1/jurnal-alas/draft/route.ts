import { NextResponse } from 'next/server'

// Mock endpoint for Lawet Hub draft journals of user
export async function GET() {
  return NextResponse.json({
    data: [
      {
        id: 'mock-jurnal-draft-1',
        source_id: 'mock-jurnal-draft-1',
        judul: 'Draf Rencana Publikasi Hasil Pengawasan Pilkada 2026',
        status: 'draft',
        kategori: 'sosialisasi',
        tanggal_kegiatan: '2026-09-01',
        created_by: 'Kasubag Humas',
        divisi: 'Divisi Pengawasan & Humas',
      },
    ],
  })
}
