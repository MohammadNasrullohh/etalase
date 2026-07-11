import { getMeAction } from '@/features/lawet-auth/api/get-me.action'
import { redirect } from 'next/navigation'
import { AuthoringShellClient } from './authoring-shell.client'

export default async function AuthoringLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getMeAction()

  if (!user) {
    redirect('/login')
  }

  const isApprover = user.role.level >= 2

  return (
    <AuthoringShellClient isApprover={isApprover}>
      {children}
    </AuthoringShellClient>
  )
}

