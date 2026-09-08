import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DokumenUploader } from '@/features/jurnal-submission/ui/components/dokumen-uploader.client'
import { dokumenPendukungItemSchema } from '@/entities/jurnal/model/submission-schema'

describe('Dokumen Pendukung & DokumenUploader', () => {
  it('dokumenPendukungItemSchema harus memberikan default is_public = false jika tidak diisi', () => {
    const parsed = dokumenPendukungItemSchema.parse({
      nama: 'Surat Tugas',
      url: 'https://minio.lan/files/surat.pdf',
      tipe: 'pdf'
    })
    expect(parsed.is_public).toBe(false)
  })

  it('menampilkan checkbox (public) dan kondisi default tidak dicentang (false)', () => {
    const mockOnChange = vi.fn()
    const items = [
      {
        nama: 'Surat Keputusan',
        url: 'https://minio.lan/files/sk.pdf',
        tipe: 'pdf' as const,
        is_public: false
      }
    ]

    render(<DokumenUploader value={items} onChange={mockOnChange} />)

    expect(screen.getByText('(public)')).toBeInTheDocument()
    const checkbox = screen.getByRole('checkbox', { name: /public/i })
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it('mengubah status is_public saat checkbox (public) diklik', () => {
    const mockOnChange = vi.fn()
    const items = [
      {
        nama: 'Surat Undangan',
        url: 'https://minio.lan/files/undangan.pdf',
        tipe: 'pdf' as const,
        is_public: false
      }
    ]

    render(<DokumenUploader value={items} onChange={mockOnChange} />)

    const checkbox = screen.getByRole('checkbox', { name: /public/i })
    fireEvent.click(checkbox)

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        nama: 'Surat Undangan',
        url: 'https://minio.lan/files/undangan.pdf',
        tipe: 'pdf',
        is_public: true
      }
    ])
  })

  it('menampilkan checkbox dicentang jika is_public = true dan dapat di-uncheck', () => {
    const mockOnChange = vi.fn()
    const items = [
      {
        nama: 'Laporan Publik',
        url: 'https://minio.lan/files/laporan.pdf',
        tipe: 'pdf' as const,
        is_public: true
      }
    ]

    render(<DokumenUploader value={items} onChange={mockOnChange} />)

    const checkbox = screen.getByRole('checkbox', { name: /public/i })
    expect(checkbox).toBeChecked()

    fireEvent.click(checkbox)

    expect(mockOnChange).toHaveBeenCalledWith([
      {
        nama: 'Laporan Publik',
        url: 'https://minio.lan/files/laporan.pdf',
        tipe: 'pdf',
        is_public: false
      }
    ])
  })
})
