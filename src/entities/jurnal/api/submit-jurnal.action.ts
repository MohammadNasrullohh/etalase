'use server'

import { cookies } from 'next/headers'
import { JurnalSubmissionPayload, jurnalSubmissionSchema } from '../model/submission-schema'
import { db } from '@/shared/lib/db'
import { jurnal, alasOutbox } from '../../../../drizzle/schema'

export async function submitJurnalAction(payload: JurnalSubmissionPayload) {
  const token = cookies().get('lawet_token')?.value
  
  if (!token) {
    return { success: false, error: 'Unauthorized. Silakan login kembali.' }
  }

  try {
    // 1. Zod Validation
    const validatedData = jurnalSubmissionSchema.parse(payload)

    // 2. Generate UUIDs
    const sourceId = crypto.randomUUID() // Generate a new UUID for the source_id

    // 3. Insert into ALAS DB (Local Write Proxy)
    await db.insert(jurnal).values({
      source_id: sourceId,
      judul: validatedData.judul,
      tanggal_kegiatan: validatedData.tanggal_kegiatan,
      kategori: validatedData.kategori,
      link_publikasi: validatedData.link_publikasi || null,
      dokumentasi: validatedData.dokumentasi,
      dokumen_pendukung: validatedData.dokumen_pendukung,
      pihak_terkait: validatedData.pihak_terkait,
      custom_fields: validatedData.custom_fields,
      tags: validatedData.tags,
      is_published: false,
      workflow_status: 'submitted',
      version: 1,
    })

    // 4. Insert into Outbox for async sync to Lawet Hub
    await db.insert(alasOutbox).values({
      source_id: sourceId,
      operation: 'CREATE_JURNAL',
      payload: validatedData,
      status: 'pending'
    })

    return { success: true, data: { source_id: sourceId } }
  } catch (error: any) {
    if (error.errors) { // Zod Error
      const msg = error.errors.map((e: any) => e.message).join(', ')
      return { success: false, error: msg }
    }
    return { success: false, error: error.message || 'Koneksi ke database gagal' }
  }
}
