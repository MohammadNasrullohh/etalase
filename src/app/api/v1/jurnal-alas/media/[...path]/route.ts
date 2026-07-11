import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const LAWET_API_URL = process.env.LAWET_API_URL as string
  if (!LAWET_API_URL) {
    return new NextResponse('LAWET_API_URL not configured', { status: 500 })
  }

  const pathStr = params.path.join('/')
  const url = `${LAWET_API_URL}/api/v1/jurnal-alas/media/${pathStr}`

  try {
    const res = await fetch(url, {
      // Forward the lawet_token cookie if it exists to allow access to protected media
      headers: {
        cookie: request.headers.get('cookie') || ''
      }
    })

    if (!res.ok) {
      return new NextResponse(await res.text(), { status: res.status })
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    const contentDisposition = res.headers.get('content-disposition')

    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Cache-Control', 'public, max-age=86400')
    if (contentDisposition) {
      headers.set('Content-Disposition', contentDisposition)
    }

    return new NextResponse(res.body, {
      status: 200,
      headers
    })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
export const dynamic = 'force-dynamic'
