'use server'

import { cookies } from 'next/headers'
import { JurnalSubmissionPayload, jurnalSubmissionSchema } from '../model/submission-schema'
import { db } from '@/shared/lib/db'
import { jurnal, alasOutbox } from '../../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'

export async function resubmitJurnalAction(id: string, payload: JurnalSubmissionPayload) {
  const token = cookies().get('lawet_token')?.value
  
  if (!token) {
    return { success: false, error: 'Unauthorized. Silakan login kembali.' }
  }

  try {
    // 1. Validasi Zod
    const validatedData = jurnalSubmissionSchema.parse(payload)

    // 2. Cek apakah Jurnal ada dan berstatus revision_required
    const existing = await db.select().from(jurnal).where(eq(jurnal.id, id as any)).limit(1)
    if (!existing.length) {
      return { success: false, error: 'Jurnal tidak ditemukan' }
    }
    
    if (existing[0].workflow_status !== 'revision_required') {
      return { success: false, error: 'Jurnal tidak dalam status revisi' }
    }

    // 3. Update data di ALAS DB
    const data = await db.update(jurnal).set({
      judul: validatedData.judul,
      tanggal_kegiatan: validatedData.tanggal_kegiatan,
      kategori: validatedData.kategori,
      link_publikasi: validatedData.link_publikasi || null,
      dokumentasi: validatedData.dokumentasi,
      dokumen_pendukung: validatedData.dokumen_pendukung,
      pihak_terkait: validatedData.pihak_terkait,
      custom_fields: validatedData.custom_fields,
      tags: validatedData.tags,
      workflow_status: 'submitted', // Kembali ke status submitted
      workflow_notes: null, // Clear notes
      updated_at: new Date(),
      version: existing[0].version + 1,
    }).where(eq(jurnal.id, id as any)).returning()

    if (!data.length) return { success: false, error: 'Gagal memperbarui jurnal' }

    // 4. Catat di Outbox untuk sinkronisasi ke Lawet Hub
    await db.insert(alasOutbox).values({
      source_id: data[0].source_id,
      operation: 'UPDATE_JURNAL',
      payload: { ...validatedData, workflow_status: 'submitted' },
      status: 'pending'
    })

    return { success: true, data: data[0] }
  } catch (error: any) {
    if (error.errors) {
      const msg = error.errors.map((e: any) => e.message).join(', ')
      return { success: false, error: msg }
    }
    return { success: false, error: error.message || 'Koneksi ke database gagal' }
  }
}
