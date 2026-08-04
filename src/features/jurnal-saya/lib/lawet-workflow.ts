export type LawetWorkflowDestination = 'submit' | 'manage' | 'edit' | 'approval'

const JOURNAL_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function buildLawetWorkflowPath(
  destination: string | undefined,
  journalId?: string,
): string | null {
  switch (destination as LawetWorkflowDestination) {
    case 'submit':
      return '/dashboard/jurnal-alas/submit'
    case 'manage':
      return '/dashboard/jurnal-alas'
    case 'approval':
      return '/dashboard/jurnal-alas/draft'
    case 'edit':
      return journalId && JOURNAL_ID_PATTERN.test(journalId)
        ? `/dashboard/jurnal-alas/submit?id=${encodeURIComponent(journalId)}`
        : null
    default:
      return null
  }
}

export function buildLawetWorkflowUrl(
  publicUrl: string | undefined,
  destination: string | undefined,
  journalId?: string,
): string | null {
  const path = buildLawetWorkflowPath(destination, journalId)
  if (!publicUrl || !path) return null

  try {
    return new URL(path, publicUrl).toString()
  } catch {
    return null
  }
}
