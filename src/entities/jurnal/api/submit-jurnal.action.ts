'use server'

import { cookies } from 'next/headers'
import { getMeAction } from '@/entities/lawet-user'
import { JurnalSubmissionPayload, jurnalSubmissionSchema } from '../model/submission-schema'
import { db } from '@/shared/lib/db'
import { jurnal, alasOutbox } from '../../../../drizzle/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function submitJurnalAction(payload: JurnalSubmissionPayload) {
  const token = cookies().get('lawet_token')?.value
  
  if (!token) {
    return { success: false, error: 'Unauthorized. Silakan login kembali.' }
  }

  const user = await getMeAction();
  if (!user) {
    return { success: false, error: 'User tidak ditemukan.' }
  }

  try {
    // 1. Zod Validation
    const validatedData = jurnalSubmissionSchema.parse(payload)

    const isUpdate = !!validatedData.id;
    const sourceId = isUpdate ? validatedData.id! : crypto.randomUUID();

    const data = {
      judul: validatedData.judul,
      ringkasan: validatedData.ringkasan || null,
      tanggal_kegiatan: validatedData.tanggal_kegiatan,
      kategori: validatedData.kategori,
      link_publikasi: validatedData.link_publikasi || null,
      dokumentasi: validatedData.dokumentasi,
      dokumen_pendukung: validatedData.dokumen_pendukung,
      pihak_terkait: validatedData.pihak_terkait,
      custom_fields: validatedData.custom_fields,
      tags: validatedData.tags,
      is_published: validatedData.is_published,
      workflow_status: (user.division?.name?.toLowerCase().includes('kasubag') || user.role?.can_approve || user.role?.is_superadmin) ? 'published' : 'publish_pending',
    };

    if (isUpdate) {
      await db.update(jurnal).set({
        ...data,
        version: 2
      }).where(eq(jurnal.id, validatedData.id!));
    } else {
      await db.insert(jurnal).values({
        id: sourceId,
        source_id: sourceId,
        ...data,
        redaksi: user.name,
        divisi: user.division?.name || 'Staf',
        version: 1,
      });
    }

    // 4. Insert into Outbox for async sync to Lawet Hub
    await db.insert(alasOutbox).values({
      source_id: sourceId,
      operation: isUpdate ? 'UPDATE_JURNAL' : 'CREATE_JURNAL',
      payload: validatedData,
      status: 'pending'
    });

    revalidatePath('/panel');

    return { success: true, data: { source_id: sourceId } }
  } catch (error: any) {
    if (error.errors) { // Zod Error
      const msg = error.errors.map((e: any) => e.message).join(', ')
      return { success: false, error: msg }
    }
    return { success: false, error: error.message || 'Koneksi ke database gagal' }
  }
}
