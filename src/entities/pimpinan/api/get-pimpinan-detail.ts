import { db } from '@/shared/lib/db'
import { pimpinan } from '../../../../drizzle/schema'
import { eq, and } from 'drizzle-orm'

export async function getPimpinanDetail(id: string, isActiveOnly = true) {
  let conditions = [eq(pimpinan.id, id)]
  if (isActiveOnly) {
    conditions.push(eq(pimpinan.is_active, true))
  }
  const results = await db.select().from(pimpinan).where(and(...conditions)).limit(1)
  return results[0] || null
}

export async function getPimpinanDetailBySourceId(sourceId: string, isActiveOnly = true) {
  let conditions = [eq(pimpinan.source_id, sourceId)]
  if (isActiveOnly) {
    conditions.push(eq(pimpinan.is_active, true))
  }
  const results = await db.select().from(pimpinan).where(and(...conditions)).limit(1)
  return results[0] || null
}
