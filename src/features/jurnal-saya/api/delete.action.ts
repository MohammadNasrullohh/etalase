'use server'

import { db } from '@/shared/lib/db'
import { eq } from 'drizzle-orm'
import { jurnal } from '../../../../drizzle/schema'
import { revalidatePath } from 'next/cache'

export async function deleteJurnalAction(id: string) {
  try {
    await db.delete(jurnal).where(eq(jurnal.id, id));
    revalidatePath('/panel');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
