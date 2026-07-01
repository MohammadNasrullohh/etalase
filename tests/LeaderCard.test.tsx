import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { LeaderCard } from '@/entities/pimpinan/ui/leader-card'
import '@testing-library/jest-dom'

describe('LeaderCard UI component', () => {
  it('renders leader name and position', () => {
    render(
      <LeaderCard
        id="1"
        nama="Dr. Agus Widodo"
        jabatan="Ketua"
        foto_url="https://media.com/foto.jpg"
      />
    )
    expect(screen.getByText('Dr. Agus Widodo')).toBeInTheDocument()
    expect(screen.getByText('Ketua')).toBeInTheDocument()
  })
})
