import { NextResponse } from 'next/server'
import { db } from '@/shared/lib/db'
import { jurnal } from '../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const rows = await db
      .selectDistinct({ kategori: jurnal.kategori })
      .from(jurnal)
      .where(eq(jurnal.is_published, true))

    const categories = rows.map(r => r.kategori)
    return NextResponse.json({
      status: 'ok',
      data: categories
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
