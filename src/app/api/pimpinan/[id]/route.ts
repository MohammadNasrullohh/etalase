import { NextResponse, NextRequest } from 'next/server'
import { getPimpinanDetail } from '@/entities/pimpinan/api/get-pimpinan-detail'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const item = await getPimpinanDetail(id, true)
    
    if (!item) {
      return NextResponse.json(
        { status: "error", message: "not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: "ok",
      data: item
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
