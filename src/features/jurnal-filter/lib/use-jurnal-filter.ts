'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export function useJurnalFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const kategori = searchParams.get('kategori') ?? ''
  const tahun = searchParams.get('tahun') ?? ''
  const date = searchParams.get('date') ?? ''

  const setFilter = useDebouncedCallback((newQ: string, newKategori: string, newTahun?: string, newDate?: string) => {
    const params = new URLSearchParams()
    if (newQ) params.set('q', newQ)
    if (newKategori) params.set('kategori', newKategori)
    if (newTahun) params.set('tahun', newTahun)
    if (newDate) params.set('date', newDate)
    
    router.replace(`/?${params.toString()}`, { scroll: false })
  }, 300)

  const resetFilter = () => {
    router.replace('/', { scroll: false })
  }

  return { q, kategori, tahun, date, setFilter, resetFilter }
}
