import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { JurnalCard } from '@/entities/jurnal/ui/jurnal-card'
import '@testing-library/jest-dom'

describe('JurnalCard UI component', () => {
  it('renders title and category', () => {
    render(
      <JurnalCard
        id="1"
        judul="MOU Universitas"
        tanggal_kegiatan="2026-06-15"
        kategori="mou"
      />
    )
    expect(screen.getByText('MOU Universitas')).toBeInTheDocument()
    expect(screen.getByText('MoU')).toBeInTheDocument()
  })
})
