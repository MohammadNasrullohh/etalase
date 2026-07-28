import type { LawetUser } from '@/features/lawet-auth/api/get-me.action'

const DEFAULT_ADMIN_ROLE_LEVEL = 3

function normalizedRoleName(name: string | undefined): string {
  return (name || '').trim().toLowerCase().replace(/[\s_-]+/g, '')
}

export function getAdminRoleLevel(): number {
  const configuredLevel = Number.parseInt(
    process.env.ALAS_ADMIN_ROLE_LEVEL || String(DEFAULT_ADMIN_ROLE_LEVEL),
    10,
  )

  return Number.isSafeInteger(configuredLevel) && configuredLevel > 0
    ? configuredLevel
    : DEFAULT_ADMIN_ROLE_LEVEL
}

/**
 * Lawet Hub adalah sumber otorisasi. Superadmin tetap dikenali walau API lama
 * tidak mengirim `role.level`; role level dipakai untuk konfigurasi instalasi lain.
 */
export function isAdminUser(user: Pick<LawetUser, 'role'> | null | undefined, minimumLevel = getAdminRoleLevel()): boolean {
  if (!user) return false

  return normalizedRoleName(user.role?.name) === 'superadmin'
    || (Number.isSafeInteger(user.role?.level) && user.role.level >= minimumLevel)
}
