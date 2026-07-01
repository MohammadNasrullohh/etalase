import { NextResponse } from 'next/server'
import { db } from '@/shared/lib/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`)
    return NextResponse.json({
      status: "ok",
      service: "alas",
      version: "1.2.0",
      db_connected: true,
      uptime_seconds: Math.floor(process.uptime()),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "internal server error",
        db_connected: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
