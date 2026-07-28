import { getMeAction, type LawetUser } from '@/features/lawet-auth/api/get-me.action'
import { isAdminUser } from './is-admin'

export async function getAdminUser(): Promise<LawetUser | null> {
  const user = await getMeAction()

  if (!isAdminUser(user)) return null
  return user
}
