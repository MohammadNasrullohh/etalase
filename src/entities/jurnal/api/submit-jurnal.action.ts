'use server'

import { JurnalSubmissionPayload } from '../model/submission-schema'

const READ_ONLY_ERROR = 'ALAS hanya menyediakan visibilitas. Lakukan perubahan di Lawet Hub.'

export async function submitJurnalAction(_payload: JurnalSubmissionPayload) {
  return { success: false as const, error: READ_ONLY_ERROR }
}
