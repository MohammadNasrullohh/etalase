import { NextResponse } from 'next/server'

// Mock endpoint for Lawet Hub published journals of user
export async function GET() {
  return NextResponse.json({
    data: [
      {
        id: 'mock-jurnal-my-1',
        source_id: 'mock-jurnal-my-1',
        judul: 'Bawaslu Kebumen Teken MoU Dengan UPB terkait Pengawasan Partisipatif',
        status: 'published',
        kategori: 'mou',
        tanggal_kegiatan: '2026-05-10',
        created_by: 'Kasubag Humas',
        divisi: 'Divisi Pengawasan & Humas',
      },
    ],
  })
}
