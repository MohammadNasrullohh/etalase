import { describe, expect, it } from 'vitest'
import {
  buildLawetWorkflowPath,
  buildLawetWorkflowUrl,
} from '@/features/jurnal-saya/lib/lawet-workflow'

describe('Lawet journal workflow destinations', () => {
  it('maps CRUD and approval actions to the current Lawet screens', () => {
    const id = '11111111-1111-4111-8111-111111111111'

    expect(buildLawetWorkflowPath('submit')).toBe('/dashboard/jurnal-alas/submit')
    expect(buildLawetWorkflowPath('manage')).toBe('/dashboard/jurnal-alas')
    expect(buildLawetWorkflowPath('approval')).toBe('/dashboard/jurnal-alas/draft')
    expect(buildLawetWorkflowPath('edit', id)).toBe(`/dashboard/jurnal-alas/submit?id=${id}`)
  })

  it('rejects malformed edit ids and invalid origins', () => {
    expect(buildLawetWorkflowPath('edit', '../../admin')).toBeNull()
    expect(buildLawetWorkflowUrl('not a url', 'manage')).toBeNull()
    expect(buildLawetWorkflowUrl('https://lawet.example/base', 'manage')).toBe('https://lawet.example/dashboard/jurnal-alas')
  })
})
