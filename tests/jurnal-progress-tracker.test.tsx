import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { JurnalProgressTracker } from '@/features/jurnal-approval/ui/jurnal-progress-tracker'
import { SiteTitleProvider } from '@/entities/site-settings/ui/site-title.client'

describe('JurnalProgressTracker', () => {
  it('shows the detailed approval timeline and submitter metadata', () => {
    render(
      <SiteTitleProvider title="ALAS Kebumen">
        <JurnalProgressTracker submittedBy="Cahya" submittedAt="2026-07-29T08:30:00.000Z" />
      </SiteTitleProvider>,
    )

    expect(screen.getByText('Jurnal diajukan')).toBeTruthy()
    expect(screen.getByText('Menunggu persetujuan')).toBeTruthy()
    expect(screen.getByText('Menunggu review approver divisi.')).toBeTruthy()
    expect(screen.getByText(/Terbit di/)).toBeTruthy()
    expect(screen.getByText('ALAS Kebumen')).toBeTruthy()
    expect(screen.getByText('Cahya')).toBeTruthy()
    expect(screen.getByText(/29 Jul 2026/)).toBeTruthy()
  })
})
