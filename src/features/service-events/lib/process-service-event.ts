import { db, type DatabaseExecutor } from '@/shared/lib/db'
import { serviceEvents } from '../../../../drizzle/schema'

interface ServiceEventInput {
  eventId: string
  resourceType: 'jurnal' | 'pimpinan'
  sourceId: string
  operation: string
}

export interface ServiceEventResult<T> {
  duplicate: boolean
  value?: T
}

export async function processServiceEvent<T>(
  input: ServiceEventInput,
  handler: (transaction: DatabaseExecutor) => Promise<T>,
): Promise<ServiceEventResult<T>> {
  return db.transaction(async (transaction) => {
    const [claimed] = await transaction.insert(serviceEvents)
      .values({
        event_id: input.eventId,
        resource_type: input.resourceType,
        source_id: input.sourceId,
        operation: input.operation,
      })
      .onConflictDoNothing({ target: serviceEvents.event_id })
      .returning({ eventId: serviceEvents.event_id })

    if (!claimed) {
      return { duplicate: true }
    }

    const value = await handler(transaction)
    return { duplicate: false, value }
  })
}
