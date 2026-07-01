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

    const stats = await getJurnalStatsByYear(targetYear)

    return NextResponse.json(
      {
        status: 'ok',
        years,
        year: targetYear,
        stats,
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
