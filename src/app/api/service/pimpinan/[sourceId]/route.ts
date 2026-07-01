import { NextRequest, NextResponse } from 'next/server'
import { authenticateService } from '@/features/service-auth/lib/verify-token'
import { db } from '@/shared/lib/db'
import { pimpinan } from '../../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest, { params }: { params: { sourceId: string } }) {
  if (!authenticateService(request)) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 })
  }

  try {
    const sourceId = params.sourceId
    const items = await db.select().from(pimpinan).where(eq(pimpinan.source_id, sourceId)).limit(1)
    const item = items[0]

    if (!item) {
      return NextResponse.json({ status: "error", message: "not found" }, { status: 404 })
    }

    return NextResponse.json({
      status: "ok",
      data: item
    })
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { sourceId: string } }) {
  if (!authenticateService(request)) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 })
  }

  try {
    const sourceId = params.sourceId
    const payload = await request.json()

    const existingItems = await db.select().from(pimpinan).where(eq(pimpinan.source_id, sourceId)).limit(1)
    const existing = existingItems[0]

    if (!existing) {
      return NextResponse.json({ status: "error", message: "not found" }, { status: 404 })
    }

    let updateFields: any = {
      updated_at: new Date()
    }

    const fields = [
      'nama', 'jabatan', 'foto_url', 'bio',
      'periode_mulai', 'periode_selesai', 'urutan', 'is_active'
    ]

    fields.forEach(field => {
      if (payload[field] !== undefined) {
        updateFields[field] = payload[field]
      }
    })

    await db.update(pimpinan)
      .set(updateFields)
      .where(eq(pimpinan.id, existing.id))

    return NextResponse.json({
      status: "ok",
      source_id: sourceId,
      action: "updated"
    })
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { sourceId: string } }) {
  if (!authenticateService(request)) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 })
  }

  try {
    const sourceId = params.sourceId
    const existingItems = await db.select().from(pimpinan).where(eq(pimpinan.source_id, sourceId)).limit(1)
    
    if (existingItems.length === 0) {
      return NextResponse.json({ status: "error", message: "not found" }, { status: 404 })
    }

    await db.update(pimpinan)
      .set({ is_active: false, updated_at: new Date() })
      .where(eq(pimpinan.source_id, sourceId))

    return NextResponse.json({
      status: "ok",
      source_id: sourceId
    })
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
  }
}
export const dynamic = 'force-dynamic'
