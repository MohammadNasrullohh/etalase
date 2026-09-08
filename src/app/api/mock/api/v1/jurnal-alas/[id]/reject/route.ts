import { NextResponse } from 'next/server'

// Mock endpoint for Lawet Hub reject/revision action
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json().catch(() => ({}))

  return NextResponse.json({
    status: 'success',
    message: `Jurnal ${params.id} dikembalikan untuk revisi (Mock Lawet Hub)`,
    data: { id: params.id, status: 'revision_required', notes: body.notes || 'Perbaiki lampiran' },
  })
}
