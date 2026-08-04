import { canApproveJurnal, getMeAction, isAdminUser } from '@/entities/lawet-user'
import { redirect } from 'next/navigation'
import { AuthoringShellClient } from './authoring-shell.client'

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
  const isApprover = canApproveJurnal(user)

  return (
    <AuthoringShellClient isApprover={isApprover} isAdmin={isAdmin}>
      {children}
    </AuthoringShellClient>
  )
}

