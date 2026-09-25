import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from '@/features/jurnal-filter/ui/search-bar.client'
import '@testing-library/jest-dom'

describe('SearchBar component', () => {
  it('renders input field with placeholder', () => {
    render(<SearchBar value="" onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('Cari jurnal...')).toBeInTheDocument()
  })

  it('triggers onChange callback when text is entered', () => {
    vi.useFakeTimers()
    const handleChange = vi.fn()
    render(<SearchBar value="" onChange={handleChange} />)
    const input = screen.getByPlaceholderText('Cari jurnal...')
    fireEvent.change(input, { target: { value: 'MoU' } })
    vi.advanceTimersByTime(350)
    expect(handleChange).toHaveBeenCalledWith('MoU')
    vi.useRealTimers()
  })
})
