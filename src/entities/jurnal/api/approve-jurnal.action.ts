'use server'

import { cookies } from 'next/headers'
import { db } from '@/shared/db'
import { jurnal, alasOutbox } from '../../../../drizzle/schema'
import { eq, or } from 'drizzle-orm'

export async function getApprovalQueueAction() {
  const token = cookies().get('lawet_token')?.value
  if (!token) return { success: false, error: 'Unauthorized' }

  try {
    const data = await db.select().from(jurnal).where(or(eq(jurnal.workflow_status, 'submitted'), eq(jurnal.workflow_status, 'revision_required')))
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getApprovalJurnalAction(id: string) {
  const token = cookies().get('lawet_token')?.value
  if (!token) return { success: false, error: 'Unauthorized' }

  try {
    const data = await db.select().from(jurnal).where(eq(jurnal.id, id as any)).limit(1)
    if (!data.length) return { success: false, error: 'Jurnal tidak ditemukan' }
    return { success: true, data: data[0] }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function approveJurnalAction(id: string) {
  const token = cookies().get('lawet_token')?.value
  if (!token) return { success: false, error: 'Unauthorized' }

  try {
    const data = await db.update(jurnal).set({
      workflow_status: 'approved',
      is_published: true,
      updated_at: new Date()
    }).where(eq(jurnal.id, id as any)).returning()

    if (!data.length) return { success: false, error: 'Jurnal tidak ditemukan' }

    await db.insert(alasOutbox).values({
      source_id: data[0].source_id,
      operation: 'UPDATE_JURNAL_STATUS',
      payload: { status: 'approved' },
      status: 'pending'
    })

    return { success: true, data: data[0] }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function requestRevisionAction(id: string, notes: string) {
  const token = cookies().get('lawet_token')?.value
  if (!token) return { success: false, error: 'Unauthorized' }

  try {
    const data = await db.update(jurnal).set({
      workflow_status: 'revision_required',
      workflow_notes: notes,
      is_published: false,
      updated_at: new Date()
    }).where(eq(jurnal.id, id as any)).returning()

    if (!data.length) return { success: false, error: 'Jurnal tidak ditemukan' }

    await db.insert(alasOutbox).values({
      source_id: data[0].source_id,
      operation: 'UPDATE_JURNAL_STATUS',
      payload: { status: 'revision_required', notes },
      status: 'pending'
    })

    return { success: true, data: data[0] }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
