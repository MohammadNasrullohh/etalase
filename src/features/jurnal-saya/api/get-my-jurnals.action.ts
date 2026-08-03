'use server'

import { cookies } from 'next/headers'
import { getMeAction } from '@/entities/lawet-user'
import { db } from '@/shared/lib/db'
import { jurnal } from '../../../../drizzle/schema'
import { eq, desc } from 'drizzle-orm'

const LAWET_API_URL = process.env.LAWET_API_URL as string

export interface MyJurnalItem {
  id: string
  source_id?: string
  judul: string
  tanggal_kegiatan: string
  kategori: string
  status: 'draft' | 'published'
}

export async function getMyJurnalsAction(): Promise<MyJurnalItem[]> {
  const me = await getMeAction()
  if (!me) {
    throw new Error('Unauthorized')
  }

  const token = cookies().get('lawet_token')?.value
  let drafts: MyJurnalItem[] = []

  // 1. Fetch Drafts from Lawet Hub
  try {
    const res = await fetch(`${LAWET_API_URL}/api/v1/jurnal-alas/draft?limit=50`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      next: { revalidate: 0 }
    })
    
    if (res.ok) {
      const data = await res.json()
      drafts = data.map((d: any) => ({
        id: d.id,
        source_id: d.id, // for draft, the ID in lawet hub is the source_id
        judul: d.judul,
        tanggal_kegiatan: d.tanggal_kegiatan,
        kategori: d.kategori,
        status: 'draft'
      }))
    } else {
      console.error('Lawet API /draft failed:', res.status, await res.text())
    }
  } catch (err) {
    console.error('Failed to fetch drafts from Lawet Hub', err)
  }

  // 2. Fetch Published from ALAS Local DB
  let published: MyJurnalItem[] = []
  try {
    const localJurnals = await db.select()
      .from(jurnal)
      .where(eq(jurnal.redaksi, me.name))
      .orderBy(desc(jurnal.tanggal_kegiatan))
      .limit(100)

    published = localJurnals.map((j) => ({
      id: j.id.toString(),
      source_id: j.source_id,
      judul: j.judul,
      tanggal_kegiatan: j.tanggal_kegiatan,
      kategori: j.kategori,
      status: 'published'
    }))
  } catch (err) {
    console.error('Failed to fetch published jurnals from ALAS DB', err)
  }

  // 3. Combine and Sort by Date Descending
  const combined = [...drafts, ...published].sort((a, b) => {
    const dateA = new Date(a.tanggal_kegiatan).getTime()
    const dateB = new Date(b.tanggal_kegiatan).getTime()
    return dateB - dateA
  })

  return combined
}
