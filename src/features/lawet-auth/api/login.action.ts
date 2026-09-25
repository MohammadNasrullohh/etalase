'use server'

import { cookies } from 'next/headers'

const LAWET_API_URL = process.env.LAWET_API_URL as string

export async function loginAction(username: string, pin: string) {
  try {
    // --- DUMMY ACCOUNTS FOR UI TESTING ---
    if (username === 'staff' && pin === '1234') {
      cookies().set({ name: 'lawet_token', value: 'dummy-staff-token', httpOnly: true, path: '/' })
      return { success: true, user: { name: 'Staff Tester' } }
    }
    if (username === 'kasubag' && pin === '1234') {
      cookies().set({ name: 'lawet_token', value: 'dummy-kasubag-token', httpOnly: true, path: '/' })
      return { success: true, user: { name: 'Kasubag Tester' } }
    }
    // -------------------------------------

    const res = await fetch(`${LAWET_API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, pin }),
    })

    const data = await res.json()

    if (!res.ok) {
      let msg = 'Username atau PIN salah'
      if (data?.detail) {
        if (typeof data.detail === 'string') msg = data.detail
        else if (Array.isArray(data.detail)) msg = data.detail.map((d: any) => d.msg).join(', ')
      }
      return { success: false, error: msg }
    }

    // Save token in HttpOnly cookie
    if (data.access_token) {
      cookies().set({
        name: 'lawet_token',
        value: data.access_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })
      
      return { success: true, user: data.user }
    }

    return { success: false, error: 'Token tidak diterima' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Koneksi ke server gagal' }
  }
}

export async function logoutAction() {
  cookies().delete('lawet_token')
  return { success: true }
}

