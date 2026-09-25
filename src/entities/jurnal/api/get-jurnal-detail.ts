import { db } from '@/shared/lib/db'
import { jurnal } from '../../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'

export async function getJurnalDetail(id: string, isPublicOnly = true) {
  let conditions = [eq(jurnal.id, id)]
  if (isPublicOnly) {
    conditions.push(eq(jurnal.is_published, true)); conditions.push(eq(jurnal.workflow_status, 'published'))
  }
  const results = await db.select().from(jurnal).where(and(...conditions)).limit(1)
  return results[0] || null
}

