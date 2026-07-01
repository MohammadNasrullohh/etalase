import { NextRequest, NextResponse } from 'next/server'
import { authenticateService } from '@/features/service-auth/lib/verify-token'
import { upsertPimpinan } from '@/features/pimpinan-sync/lib/upsert-pimpinan'
import { db } from '@/shared/lib/db'
import { pimpinan } from '../../../../../drizzle/schema'

export async function POST(request: NextRequest) {
  if (!authenticateService(request)) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 })
  }

  try {
    const payload = await request.json()
    if (!payload.source_id || !payload.nama || !payload.jabatan || !payload.periode_mulai) {
      return NextResponse.json({ status: "error", message: "validation error" }, { status: 422 })
    }

    const { id, action } = await upsertPimpinan(payload)
    return NextResponse.json(
      { status: "ok", id, source_id: payload.source_id, action },
      { status: action === "created" ? 201 : 200 }
    )
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  if (!authenticateService(request)) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 })
  }

  try {
    const items = await db.select()
      .from(pimpinan)
      .orderBy(pimpinan.periode_mulai, pimpinan.urutan)
    
    return NextResponse.json({
      status: "ok",
      data: items
    })
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
  }
}
export const dynamic = 'force-dynamic'
