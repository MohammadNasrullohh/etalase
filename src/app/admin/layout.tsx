import { redirect } from 'next/navigation'
import { getMeAction, isAdminUser } from '@/entities/lawet-user'
import { AuthoringShellClient } from '../(authoring)/authoring-shell.client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getMeAction()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = isAdminUser(user)

  return (
    <AuthoringShellClient isApprover={isAdmin || user.role.level >= 2} isAdmin={isAdmin}>
      {children}
    </AuthoringShellClient>
  )
}
