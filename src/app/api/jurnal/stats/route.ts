import { NextResponse, NextRequest } from 'next/server'
import { getJurnalYears, getJurnalStatsByYear } from '@/entities/jurnal/api/get-jurnal-stats'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const yearParam = searchParams.get('year')

    // Selalu ambil daftar tahun
    const years = await getJurnalYears()

    // Jika tidak ada tahun parameter, gunakan tahun terbaru
    const targetYear = yearParam
      ? parseInt(yearParam, 10)
      : (years[years.length - 1] ?? new Date().getFullYear())

    const result = await getJurnalStatsByYear(targetYear)

    return NextResponse.json(
      {
        status: 'ok',
        years,
        year: targetYear,
        stats: result.stats,
        mitra_stats: result.mitra_stats,
        media_stats: result.media_stats,
        monthly_trend: result.monthly_trend,
        daily_trend: result.daily_trend,
        division_stats: result.division_stats,
        kpi_summary: result.kpi_summary,
        recent_highlights: result.recent_highlights,
      },
      {
        headers: {
          // Cache 1 jam di CDN/edge, revalidate di background
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
