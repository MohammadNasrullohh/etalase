import { getMeAction, type LawetUser } from '@/features/lawet-auth/api/get-me.action'

const DEFAULT_ADMIN_ROLE_LEVEL = 3

export async function getAdminUser(): Promise<LawetUser | null> {
  const user = await getMeAction()
  const configuredLevel = Number.parseInt(
    process.env.ALAS_ADMIN_ROLE_LEVEL || String(DEFAULT_ADMIN_ROLE_LEVEL),
    10,
  )
  const minimumLevel = Number.isSafeInteger(configuredLevel) && configuredLevel > 0
    ? configuredLevel
    : DEFAULT_ADMIN_ROLE_LEVEL

  if (!user || !Number.isSafeInteger(user.role?.level) || user.role.level < minimumLevel) return null
  return user
}
