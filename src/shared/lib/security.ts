import { NextRequest } from 'next/server'

/** Menolak mutasi yang tidak datang dari origin aplikasi sendiri (CSRF defense). */
export function hasSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin') || request.headers.get('referer')
  if (!origin) return false

  try {
    return new URL(origin).host === request.nextUrl.host
  } catch {
    return false
  }
}
