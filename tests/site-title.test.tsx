import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SiteTitle, SiteTitleProvider } from '@/entities/site-settings/ui/site-title.client'

describe('SiteTitle', () => {
  it('renders the title supplied by the global settings provider', () => {
    render(
      <SiteTitleProvider title="Ruang Aspirasi">
        <SiteTitle />
      </SiteTitleProvider>,
    )

    expect(screen.getByText('Ruang Aspirasi')).toBeTruthy()
  })
})
