import { getMeAction, isAdminUser, type LawetUser } from '@/entities/lawet-user'

export async function getAdminUser(): Promise<LawetUser | null> {
  const user = await getMeAction()

  if (!isAdminUser(user)) return null
  return user
}
