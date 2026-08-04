import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getMe: vi.fn(),
  cookieGet: vi.fn(() => ({ value: 'read-token' })),
}))

vi.mock('next/headers', () => ({
  cookies: () => ({ get: mocks.cookieGet }),
}))

vi.mock('@/entities/lawet-user', () => ({
  getMeAction: mocks.getMe,
  canApproveJurnal: (user: { role?: { can_approve?: boolean; level?: number; is_superadmin?: boolean } } | null) => Boolean(
    user && (user.role?.can_approve || user.role?.is_superadmin || (user.role?.level || 0) >= 2),
  ),
}))

const ownDraft = {
  id: '11111111-1111-4111-8111-111111111111',
  judul: 'Draft Saya',
  tanggal_kegiatan: '2026-08-03',
  kategori: 'rapat',
  status: 'draft',
  submitter: { id: 'staff-1', name: 'Siti' },
}

const ownPublished = {
  id: '22222222-2222-4222-8222-222222222222',
  judul: 'Jurnal Saya Terbit',
  tanggal_kegiatan: '2026-08-02',
  kategori: 'pelaporan',
  status: 'published',
  created_by: 'Siti',
  divisi: 'Humas',
}

const subordinatePublished = {
  id: '33333333-3333-4333-8333-333333333333',
  judul: 'Jurnal Bawahan Terbit',
  tanggal_kegiatan: '2026-08-01',
  kategori: 'pengawasan',
  status: 'published',
  submitter: { id: 'staff-2', name: 'Budi' },
  divisi: 'Humas',
}

function installFetch(reviewQueue: unknown[] = []) {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const url = String(input)
    const payload = url.includes('/approval-queue')
      ? reviewQueue
      : url.includes('/draft?')
        ? [ownDraft]
        : [ownPublished, subordinatePublished]
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('Jurnal workspace visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('LAWET_API_URL', 'http://lawet.internal')
  })

  it('shows only the staff member own draft and published journals', async () => {
    mocks.getMe.mockResolvedValue({
      id: 'staff-1',
      name: 'Siti',
      username: 'siti',
      role: { id: 'role-1', name: 'Staf', level: 1, can_approve: false },
      division: { id: 'division-1', name: 'Humas' },
    })
    const fetchMock = installFetch()

    const { getJurnalWorkspaceAction } = await import('@/features/jurnal-saya/api/get-my-jurnals.action')
    const workspace = await getJurnalWorkspaceAction()

    expect(workspace.mine.map((item) => item.judul)).toEqual(['Draft Saya', 'Jurnal Saya Terbit'])
    expect(workspace.subordinates).toEqual([])
    expect(workspace.canReview).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('gives an approver a separate division-scoped subordinate journal list', async () => {
    mocks.getMe.mockResolvedValue({
      id: 'approver-1',
      name: 'Rina',
      username: 'rina',
      role: { id: 'role-2', name: 'Kasubag', level: 2, can_approve: true },
      division: { id: 'division-1', name: 'Humas' },
    })
    installFetch([{
      ...ownDraft,
      id: '44444444-4444-4444-8444-444444444444',
      judul: 'Menunggu Review Kasubag',
      submitter: { id: 'staff-2', name: 'Budi' },
    }])

    const { getJurnalWorkspaceAction } = await import('@/features/jurnal-saya/api/get-my-jurnals.action')
    const workspace = await getJurnalWorkspaceAction()

    expect(workspace.canReview).toBe(true)
    expect(workspace.divisionName).toBe('Humas')
    expect(workspace.mine).toEqual([])
    expect(workspace.subordinates.map((item) => item.judul)).toEqual([
      'Menunggu Review Kasubag',
      'Jurnal Saya Terbit',
      'Jurnal Bawahan Terbit',
    ])
    expect(workspace.subordinates.every((item) => item.scope === 'subordinate')).toBe(true)
  })

  it('keeps usable data and returns a warning when one Lawet read fails', async () => {
    mocks.getMe.mockResolvedValue({
      id: 'staff-1',
      name: 'Siti',
      username: 'siti',
      role: { id: 'role-1', name: 'Staf', level: 1 },
    })
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes('/draft?')) return new Response('offline', { status: 503 })
      return Response.json([ownPublished])
    }))

    const { getJurnalWorkspaceAction } = await import('@/features/jurnal-saya/api/get-my-jurnals.action')
    const workspace = await getJurnalWorkspaceAction()

    expect(workspace.mine).toHaveLength(1)
    expect(workspace.warnings[0]).toContain('Draft jurnal tidak dapat dimuat')
  })
})
