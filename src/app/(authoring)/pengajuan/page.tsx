import { JurnalSubmitForm } from '@/features/jurnal-submission/ui/jurnal-submit-form.client'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <JurnalSubmitForm />
    </div>
  )
}
