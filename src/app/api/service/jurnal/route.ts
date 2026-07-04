import { NextRequest, NextResponse } from 'next/server'
import { authenticateService } from '@/features/service-auth/lib/verify-token'
import { upsertJurnal } from '@/features/jurnal-sync/lib/upsert-jurnal'
import { db } from '@/shared/lib/db'
import { jurnal } from '../../../../../drizzle/schema'
import { eq, ilike, or, and, sql, gte, lte } from 'drizzle-orm'

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
    const { searchParams } = new URL(request.url)
    const pageStr = searchParams.get('page')
    const limitStr = searchParams.get('limit')
    const divisiParam = searchParams.get('divisi')
    const searchParam = searchParams.get('search')
    const startDateParam = searchParams.get('start_date')
    const endDateParam = searchParams.get('end_date')

    const filters = []
    if (divisiParam) {
      filters.push(eq(jurnal.divisi, divisiParam))
    }
    if (searchParam) {
      filters.push(
        or(
          ilike(jurnal.judul, `%${searchParam}%`),
          sql`${jurnal.tags}::text ilike ${`%${searchParam}%`}`
        )
      )
    }
    if (startDateParam) {
      filters.push(gte(jurnal.tanggal_kegiatan, startDateParam))
    }
    if (endDateParam) {
      filters.push(lte(jurnal.tanggal_kegiatan, endDateParam))
    }

    let baseQuery = db.select().from(jurnal)
    if (filters.length > 0) {
      baseQuery = baseQuery.where(and(...filters)) as any
    }

    const sortParam = searchParams.get('sort') || 'tanggal_desc'
    let orderExpression = [sql`${jurnal.tanggal_kegiatan} DESC`, sql`${jurnal.id} DESC`]
    if (sortParam === 'tanggal_asc') {
      orderExpression = [sql`${jurnal.tanggal_kegiatan} ASC`, sql`${jurnal.id} ASC`]
    } else if (sortParam === 'judul_asc') {
      orderExpression = [sql`${jurnal.judul} ASC`, sql`${jurnal.id} DESC`]
    } else if (sortParam === 'judul_desc') {
      orderExpression = [sql`${jurnal.judul} DESC`, sql`${jurnal.id} DESC`]
    }

    const orderedQuery = baseQuery.orderBy(...orderExpression)

    if (pageStr || limitStr) {
      const page = Math.max(1, parseInt(pageStr || '1') || 1)
      const limit = Math.max(1, Math.min(100, parseInt(limitStr || '12') || 12))
      const offset = (page - 1) * limit
      
      const paginatedItems = await orderedQuery.limit(limit).offset(offset)
      return NextResponse.json({
        status: "ok",
        data: paginatedItems
      })
    }

    const items = await orderedQuery
    return NextResponse.json({
      status: "ok",
      data: items
    })
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
  }
}
export const dynamic = 'force-dynamic'
