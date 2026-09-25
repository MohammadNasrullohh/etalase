import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { JurnalCard } from '@/entities/jurnal/ui/jurnal-card'
import '@testing-library/jest-dom'

describe('JurnalCard UI component', () => {
  it('renders title, category and tags', () => {
    render(
      <JurnalCard
        id="1"
        judul="MOU Universitas"
        tanggal_kegiatan="2026-06-15"
        kategori="mou"
        tags={['test', 'alas']}
      />
    )
    expect(screen.getByText('MOU Universitas')).toBeInTheDocument()
    expect(screen.getByText('Mou')).toBeInTheDocument()
    expect(screen.getByText('#test')).toBeInTheDocument()
    expect(screen.getByText('#alas')).toBeInTheDocument()
  })
})
