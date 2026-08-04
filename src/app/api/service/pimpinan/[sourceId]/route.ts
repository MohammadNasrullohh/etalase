import { NextRequest, NextResponse } from 'next/server'
import { authenticateService, authenticateServiceWrite, getServiceEventId } from '@/features/service-auth/lib/verify-token'
import { processServiceEvent } from '@/features/service-events/lib/process-service-event'
import { pimpinanPatchSchema } from '@/features/jurnal-sync/model/service-payload'
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
  } catch {
    return NextResponse.json({ status: "error", message: "internal error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { sourceId: string } }) {
  const body = await request.text()
  if (!authenticateServiceWrite(request, body)) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 })
  }

  try {
    const sourceId = params.sourceId
    const eventId = getServiceEventId(request)
    if (!eventId) {
      return NextResponse.json({ status: "error", message: "invalid event id" }, { status: 422 })
    }
    const parsed = pimpinanPatchSchema.safeParse(JSON.parse(body))
    if (!parsed.success) {
      return NextResponse.json({ status: "error", message: "validation error" }, { status: 422 })
    }
    const payload = parsed.data
    const payloadFields: Record<string, unknown> = payload

    let updateFields: any = {
      updated_at: new Date()
    }

    const fields = [
      'nama', 'jabatan', 'foto_url', 'bio',
      'periode_mulai', 'periode_selesai', 'urutan', 'is_active'
    ]

    fields.forEach(field => {
      if (payloadFields[field] !== undefined) {
        updateFields[field] = payloadFields[field]
      }
    })

    const result = await processServiceEvent({
      eventId,
      resourceType: 'pimpinan',
      sourceId,
      operation: 'patch',
    }, async (transaction) => {
      const [updated] = await transaction.update(pimpinan)
        .set(updateFields)
        .where(eq(pimpinan.source_id, sourceId))
        .returning({ id: pimpinan.id })
      return updated || null
    })
    if (result.duplicate) {
      return NextResponse.json({ status: "ok", source_id: sourceId, action: "duplicate" })
    }
    if (!result.value) {
      return NextResponse.json({ status: "error", message: "not found" }, { status: 404 })
    }

    return NextResponse.json({
      status: "ok",
      source_id: sourceId,
      action: "updated"
    })
  } catch {
    return NextResponse.json({ status: "error", message: "internal error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { sourceId: string } }) {
  if (!authenticateServiceWrite(request, '')) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 })
  }

  try {
    const sourceId = params.sourceId
    const eventId = getServiceEventId(request)
    if (!eventId) {
      return NextResponse.json({ status: "error", message: "invalid event id" }, { status: 422 })
    }
    const result = await processServiceEvent({
      eventId,
      resourceType: 'pimpinan',
      sourceId,
      operation: 'delete',
    }, async (transaction) => {
      const [updated] = await transaction.update(pimpinan)
        .set({ is_active: false, updated_at: new Date() })
        .where(eq(pimpinan.source_id, sourceId))
        .returning({ id: pimpinan.id })
      return updated || null
    })
    if (result.duplicate) {
      return NextResponse.json({ status: "ok", source_id: sourceId, action: "duplicate" })
    }
    if (!result.value) {
      return NextResponse.json({ status: "error", message: "not found" }, { status: 404 })
    }

    return NextResponse.json({
      status: "ok",
      source_id: sourceId
    })
  } catch {
    return NextResponse.json({ status: "error", message: "internal error" }, { status: 500 })
  }
}
export const dynamic = 'force-dynamic'
