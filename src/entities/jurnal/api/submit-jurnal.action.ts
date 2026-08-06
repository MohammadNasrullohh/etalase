'use server'

import { cookies } from 'next/headers'
import { JurnalSubmissionPayload } from '../model/submission-schema'

const LAWET_API_URL = process.env.LAWET_API_URL as string

export async function submitJurnalAction(payload: JurnalSubmissionPayload) {
  const token = cookies().get('lawet_token')?.value
  
  if (!token) {
    return { success: false, error: 'Unauthorized. Silakan login kembali.' }
  }

  try {
    const res = await fetch(`${LAWET_API_URL}/api/v1/jurnal-alas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      let msg = 'Gagal mengirim pengajuan'
      if (data?.detail) {
        if (typeof data.detail === 'string') msg = data.detail
        else if (Array.isArray(data.detail)) msg = data.detail.map((d: any) => d.msg).join(', ')
      }
      return { success: false, error: msg }
    }

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message || 'Koneksi ke server gagal' }
  }
}
