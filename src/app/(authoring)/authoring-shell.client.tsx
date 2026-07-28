'use client'

import { useState } from 'react'
import { AuthButton } from '@/shared/ui/auth-button.client'
import { AuthoringSidebarClient } from './sidebar.client'
import { Menu, X } from 'lucide-react'

interface Props {
  isApprover: boolean
  isAdmin: boolean
  children: React.ReactNode
}

export function AuthoringShellClient({ isApprover, isAdmin, children }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#0C0C0C]">
      
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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
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
        <header className="h-16 bg-[#111] border-b border-white/10 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-white font-bold tracking-widest font-mono lg:hidden text-sm">
              ΛLΛS PANEL
            </span>
          </div>
          
          <div className="hidden lg:flex items-center text-white/50 text-sm font-medium">
            Panel Arsip Langkah Bawaslu Kebumen
          </div>
          
          <div className="flex items-center">
            <AuthButton />
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
