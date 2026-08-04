'use server'

import { cookies } from 'next/headers'

const LAWET_API_URL = process.env.LAWET_API_URL as string

async function fetchWithToken(endpoint: string, options: RequestInit = {}) {
  const token = cookies().get('lawet_token')?.value
  if (!token) throw new Error('Unauthorized')

  const res = await fetch(`${LAWET_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    let msg = 'Request failed'
    if (data?.detail) {
      if (typeof data.detail === 'string') msg = data.detail
      else if (Array.isArray(data.detail)) msg = data.detail.map((d: any) => d.msg).join(', ')
    }
    throw new Error(msg)
  }

  return res.json()
}

export async function getApprovalQueueAction() {
  try {
    const data = await fetchWithToken('/api/v1/jurnal-alas/approval-queue')
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getApprovalJurnalAction(id: string) {
  try {
    const data = await fetchWithToken(`/api/v1/jurnal-alas/approval-queue/${id}`)
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

