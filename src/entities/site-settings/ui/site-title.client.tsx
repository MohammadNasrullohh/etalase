'use client'

import { createContext, useContext } from 'react'
import { DEFAULT_HERO_TITLE } from '../lib/hero-title'

const SiteTitleContext = createContext(DEFAULT_HERO_TITLE)

export function SiteTitleProvider({ title, children }: { title: string; children: React.ReactNode }) {
  return <SiteTitleContext.Provider value={title}>{children}</SiteTitleContext.Provider>
}

export function useSiteTitle() {
  return useContext(SiteTitleContext)
}

export function SiteTitle({ className }: { className?: string }) {
  return <span className={className}>{useSiteTitle()}</span>
}
