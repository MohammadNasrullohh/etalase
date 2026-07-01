import { NextRequest, NextResponse } from 'next/server'
import { authenticateService } from '@/features/service-auth/lib/verify-token'
import { upsertJurnal } from '@/features/jurnal-sync/lib/upsert-jurnal'
import { db } from '@/shared/lib/db'
import { jurnal } from '../../../../../drizzle/schema'
import { sql } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  if (!authenticateService(request)) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 })
  }

  try {
    const payload = await request.json()
    if (!payload.source_id || !payload.judul || !payload.tanggal_kegiatan || !payload.kategori) {
      return NextResponse.json({ status: "error", message: "validation error" }, { status: 422 })
    }

    const { id, action } = await upsertJurnal(payload)
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
      .from(jurnal)
      .orderBy(sql`${jurnal.tanggal_kegiatan} DESC`, sql`${jurnal.id} DESC`)
    
    return NextResponse.json({
      status: "ok",
      data: items
    })
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
  }
}
export const dynamic = 'force-dynamic'
