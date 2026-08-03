import { NextRequest, NextResponse } from 'next/server'
import { authenticateService, authenticateServiceWrite, getServiceEventId } from '@/features/service-auth/lib/verify-token'
import { upsertPimpinan } from '@/features/pimpinan-sync/lib/upsert-pimpinan'
import { processServiceEvent } from '@/features/service-events/lib/process-service-event'
import { pimpinanPayloadSchema } from '@/features/jurnal-sync/model/service-payload'
import { db } from '@/shared/lib/db'
import { pimpinan } from '../../../../../drizzle/schema'

export async function POST(request: NextRequest) {
  const body = await request.text()
  if (!authenticateServiceWrite(request, body)) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 })
  }

  try {
    const eventId = getServiceEventId(request)
    if (!eventId) {
      return NextResponse.json({ status: "error", message: "invalid event id" }, { status: 422 })
    }
    const parsed = pimpinanPayloadSchema.safeParse(JSON.parse(body))
    if (!parsed.success) {
      return NextResponse.json({ status: "error", message: "validation error" }, { status: 422 })
    }
    const payload = parsed.data

    const result = await processServiceEvent({
      eventId,
      resourceType: 'pimpinan',
      sourceId: payload.source_id,
      operation: 'upsert',
    }, (transaction) => upsertPimpinan(payload, transaction))
    if (result.duplicate) {
      return NextResponse.json({ status: "ok", source_id: payload.source_id, action: "duplicate" })
    }
    const { id, action } = result.value!
    return NextResponse.json(
      { status: "ok", id, source_id: payload.source_id, action },
      { status: action === "created" ? 201 : 200 }
    )
  } catch {
    return NextResponse.json({ status: "error", message: "internal error" }, { status: 500 })
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
  } catch {
    return NextResponse.json({ status: "error", message: "internal error" }, { status: 500 })
  }
}
export const dynamic = 'force-dynamic'
