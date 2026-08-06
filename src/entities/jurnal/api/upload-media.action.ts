'use server'

import { cookies } from 'next/headers'

const LAWET_API_URL = process.env.LAWET_API_URL as string

export async function uploadFotoAction(formData: FormData) {
  try {
    const token = cookies().get('lawet_token')?.value
    if (!token) throw new Error('Tidak ada akses (token hilang)')

    const res = await fetch(`${LAWET_API_URL}/api/v1/jurnal-alas/upload/foto`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData 
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Gagal mengunggah foto')
    
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function uploadDokumenAction(formData: FormData) {
  try {
    const token = cookies().get('lawet_token')?.value
    if (!token) throw new Error('Tidak ada akses (token hilang)')

    const res = await fetch(`${LAWET_API_URL}/api/v1/jurnal-alas/upload/dokumen`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Gagal mengunggah dokumen')
    
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
