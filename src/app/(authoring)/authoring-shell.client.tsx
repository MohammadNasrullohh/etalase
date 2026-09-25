'use client'

import { useState } from 'react'
import { AuthButton } from '@/features/lawet-auth/ui/auth-button.client'
import { AuthoringSidebarClient } from './sidebar.client'
import { Menu } from 'lucide-react'
import { useSiteTitle } from '@/entities/site-settings/ui/site-title.client'
import type { LawetUser } from '@/entities/lawet-user'

interface Props {
  isApprover: boolean
  isAdmin: boolean
  user: LawetUser
  children: React.ReactNode
}

export function AuthoringShellClient({ isApprover, isAdmin, user, children }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const siteTitle = useSiteTitle()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-canvas)] text-[var(--color-text-primary)]">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AuthoringSidebarClient isApprover={isApprover} isAdmin={isAdmin} />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
          onClick={() => setMobileMenuOpen(false)}
        />
        <div 
          className={`absolute inset-y-0 left-0 w-[280px] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <AuthoringSidebarClient isApprover={isApprover} isAdmin={isAdmin} onMobileClose={() => setMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 bg-[var(--color-surface-raised)] border-b border-[var(--glass-border-subtle)] flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 -ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-raised)] rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-[var(--color-text-primary)] font-bold tracking-widest font-mono lg:hidden text-sm">
              {siteTitle} PANEL
            </span>
          </div>
          
          <div className="hidden lg:flex items-center text-[var(--color-text-muted)] text-sm font-medium">
            Panel Arsip Jurnal Bawaslu Kebumen
          </div>
          
          <div className="flex items-center">
            <AuthButton initialUser={user} />
          </div>
        </header>
        
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
