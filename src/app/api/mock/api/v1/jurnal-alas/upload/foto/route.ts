import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    const fileName = file?.name || `mock-foto-${Date.now()}.jpg`
    const objectName = `alas/foto/${Date.now()}-${fileName}`

    return NextResponse.json({
      success: true,
      url: `https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80`,
      object_name: objectName,
    })
  } catch (error) {
    return NextResponse.json(
      { detail: 'Gagal mengunggah foto mock' },
      { status: 500 }
    )
  }
}
