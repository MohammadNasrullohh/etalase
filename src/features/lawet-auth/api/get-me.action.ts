'use server'

import { cookies } from 'next/headers'

const LAWET_API_URL = process.env.LAWET_API_URL as string

export type LawetUser = {
  id: string
  name: string
  username: string
  role: {
    id: string
    name: string
    level: number
  }
}

export async function getMeAction(): Promise<LawetUser | null> {
  try {
    const token = cookies().get('lawet_token')?.value
    if (!token) return null

    const res = await fetch(`${LAWET_API_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      next: { revalidate: 0 } // no cache
    })

    if (!res.ok) {
      // If token is invalid/expired, we could also remove it, but let's just return null
      return null
    }

    const data = await res.json()
    // Depending on whether it returns auth_user_dict or user_dict:
    // If it's auth_user_dict: data.role is a string. If user_dict, it's an object.
    // Let's normalize it.
    
    const rawRole = typeof data.role === 'string'
      ? { id: '', name: data.role, level: data.level }
      : (data.role || {})
    const roleLevel = Number(rawRole.level ?? data.level ?? 0)

    return {
      id: data.id,
      name: data.name,
      username: data.username,
      role: {
        id: String(rawRole.id || ''),
        name: String(rawRole.name || data.role_name || ''),
        level: Number.isFinite(roleLevel) ? roleLevel : 0,
      },
    }
  } catch (error) {
    console.error('getMeAction error:', error)
    return null
  }
}

export async function logoutAction() {
  cookies().delete('lawet_token')
  return { success: true }
}
