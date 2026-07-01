import { NextRequest, NextResponse } from 'next/server'
import { authenticateService } from '@/features/service-auth/lib/verify-token'
import { db } from '@/shared/lib/db'
import { jurnal } from '../../../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(request: NextRequest, { params }: { params: { sourceId: string } }) {
  if (!authenticateService(request)) {
    return NextResponse.json({ status: "error", message: "unauthorized" }, { status: 401 })
  }

  try {
    const sourceId = params.sourceId
    const payload = await request.json()

    if (!payload.dokumen_pendukung || !Array.isArray(payload.dokumen_pendukung)) {
      return NextResponse.json({ status: "error", message: "validation error" }, { status: 422 })
    }

    const existingItems = await db.select().from(jurnal).where(eq(jurnal.source_id, sourceId)).limit(1)
    const existing = existingItems[0]

    if (!existing) {
      return NextResponse.json({ status: "error", message: "not found" }, { status: 404 })
    }

    const docs = payload.dokumen_pendukung.map((d: any) => ({
      nama: d.nama,
      url: d.url,
      tipe: d.tipe,
      is_public: d.is_public !== false
    }))

    await db.update(jurnal)
      .set({ dokumen_pendukung: docs, updated_at: new Date() })
      .where(eq(jurnal.id, existing.id))

    return NextResponse.json({
      status: "ok",
      updated: docs.length
    })
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
  }
}
export const dynamic = 'force-dynamic'
