import { getMeAction } from '@/features/lawet-auth/api/get-me.action'
import { redirect } from 'next/navigation'
import { AuthoringShellClient } from './authoring-shell.client'
import { isAdminUser } from '@/features/admin-auth/lib/is-admin'

export const dynamic = 'force-dynamic'

export default async function AuthoringLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getMeAction()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = isAdminUser(user)
  const isApprover = isAdmin || user.role.level >= 2

  return (
    <AuthoringShellClient isApprover={isApprover} isAdmin={isAdmin}>
      {children}
    </AuthoringShellClient>
  )
}

