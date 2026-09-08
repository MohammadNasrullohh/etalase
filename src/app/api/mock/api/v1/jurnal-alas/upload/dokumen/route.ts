import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const nama = (formData.get('nama') as string) || file?.name || 'Dokumen Pendukung'

    const fileName = file?.name || `mock-doc-${Date.now()}.pdf`
    const objectName = `alas/dokumen/${Date.now()}-${fileName}`

    return NextResponse.json({
      success: true,
      nama,
      url: `https://example.com/files/${fileName}`,
      object_name: objectName,
      tipe: 'pdf',
    })
  } catch (error) {
    return NextResponse.json(
      { detail: 'Gagal mengunggah dokumen mock' },
      { status: 500 }
    )
  }
}
