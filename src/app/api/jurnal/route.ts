import { NextResponse, NextRequest } from 'next/server'
import { encodeJurnalCursor, getJurnalList } from '@/entities/jurnal/api/get-jurnal-list'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q') || ''
    const kategori = searchParams.get('kategori') || ''
    const date = searchParams.get('date') || ''
    const cursor = searchParams.get('cursor') || ''
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50)

    const rawItems = await getJurnalList({ q, kategori, cursor, limit, date })

    const hasMore = rawItems.length > limit
    const pageItems = rawItems.slice(0, limit)
    const nextCursor = hasMore ? encodeJurnalCursor(pageItems[pageItems.length - 1]) : null

    const transformedItems = pageItems.map(item => {
      const docs = Array.isArray(item.dokumen_pendukung) ? item.dokumen_pendukung : []
      const publicDocs = docs.filter((d: any) => d && d.is_public === true)
      
      const docPhotos = Array.isArray(item.dokumentasi) ? item.dokumentasi : []
      const firstPhoto = docPhotos.find((d: any) => d && d.type === 'image')
      const thumbnailUrl = firstPhoto ? firstPhoto.url : null

      return {
        id: item.id,
        source_id: item.source_id,
        judul: item.judul,
        tanggal_kegiatan: item.tanggal_kegiatan,
        kategori: item.kategori,
        link_publikasi: item.link_publikasi,
        thumbnail_url: thumbnailUrl,
        pihak_terkait: item.pihak_terkait,
        dokumentasi: item.dokumentasi,
        dokumen_pendukung: publicDocs.map(({ is_public, ...rest }: any) => rest),
        custom_fields: item.custom_fields,
        tags: item.tags,
        redaksi: item.redaksi,
        created_at: item.created_at,
      }
    })

    return NextResponse.json({
      status: "ok",
      data: transformedItems,
      pagination: {
        next_cursor: nextCursor,
        has_more: hasMore,
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    )
  }
}
export const dynamic = 'force-dynamic'
