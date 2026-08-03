import { NextRequest, NextResponse } from 'next/server'
import { authenticateServiceWrite, getServiceEventId } from '@/features/service-auth/lib/verify-token'
import { processServiceEvent } from '@/features/service-events/lib/process-service-event'
import { dokumenPatchSchema } from '@/features/jurnal-sync/model/service-payload'
import { jurnal } from '../../../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

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
    const parsed = dokumenPatchSchema.safeParse(JSON.parse(body))
    if (!parsed.success) {
      return NextResponse.json({ status: "error", message: "validation error" }, { status: 422 })
    }
    const payload = parsed.data

    const docs = payload.dokumen_pendukung.map((d: any) => ({
      nama: d.nama,
      url: d.url,
      tipe: d.tipe,
      is_public: d.is_public !== false
    }))

    const result = await processServiceEvent({
      eventId,
      resourceType: 'jurnal',
      sourceId,
      operation: 'patch_dokumen',
    }, async (transaction) => {
      const [existing] = await transaction.select({ id: jurnal.id }).from(jurnal).where(eq(jurnal.source_id, sourceId)).limit(1)
      if (!existing) return null
      await transaction.update(jurnal)
        .set({ dokumen_pendukung: docs, synced_at: new Date(), updated_at: new Date() })
        .where(eq(jurnal.id, existing.id))
      return true
    })

    if (result.duplicate) {
      return NextResponse.json({ status: "ok", updated: docs.length, action: "duplicate" })
    }
    if (!result.value) {
      return NextResponse.json({ status: "error", message: "not found" }, { status: 404 })
    }

    return NextResponse.json({
      status: "ok",
      updated: docs.length
    })
  } catch {
    return NextResponse.json({ status: "error", message: "internal error" }, { status: 500 })
  }
}
export const dynamic = 'force-dynamic'
