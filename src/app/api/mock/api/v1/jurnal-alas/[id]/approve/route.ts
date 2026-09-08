import { NextResponse } from 'next/server'

// Mock endpoint for Lawet Hub approve action
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    status: 'success',
    message: `Jurnal ${params.id} berhasil disetujui (Mock Lawet Hub)`,
    data: { id: params.id, status: 'approved' },
  })
}
