import { NextResponse, NextRequest } from 'next/server'
import { getJurnalCalendar } from '@/entities/jurnal/api/get-jurnal-calendar'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') || '' // YYYY-MM
    
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { status: "error", message: "invalid month format, expected YYYY-MM" },
        { status: 400 }
      )
    }

    const calendarData = await getJurnalCalendar(month)
    return NextResponse.json({
      status: "ok",
      data: calendarData
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
