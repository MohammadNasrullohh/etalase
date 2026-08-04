import { canApproveJurnal, getMeAction } from '@/entities/lawet-user'
import { ApprovalView } from '@/views/approval/ui'
import { redirect } from 'next/navigation'

export default async function Page() {
  const user = await getMeAction()
  if (!canApproveJurnal(user)) redirect('/jurnal-saya')

  return <ApprovalView />
}
