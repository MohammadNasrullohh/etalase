'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Folder, CheckSquare, Home, LayoutDashboard } from 'lucide-react'
import { useSiteTitle } from '@/entities/site-settings/ui/site-title.client'

interface Props {
  isApprover: boolean
  isAdmin: boolean
  onMobileClose?: () => void
}

export function AuthoringSidebarClient({ isApprover, isAdmin, onMobileClose }: Props) {
  const pathname = usePathname()
  const siteTitle = useSiteTitle()

  const links = [
    {
      href: '/pengajuan',
      label: 'Tambah Jurnal',
      icon: <FileText className="w-5 h-5" />
    },
    {
      href: '/jurnal-saya',
      label: 'Jurnal Saya',
      icon: <Folder className="w-5 h-5" />
    },
    ...(isApprover ? [{
      href: '/approval',
      label: 'Approval',
      icon: <CheckSquare className="w-5 h-5" />
    }] : []),
    ...(isAdmin ? [{
      href: '/admin',
      label: 'Dashboard Admin',
      icon: <LayoutDashboard className="w-5 h-5" />
    }] : [])
  ]

  return (
    <aside className="w-[280px] h-full bg-[var(--color-surface-raised)] lg:border-r border-[var(--glass-border-subtle)] flex flex-col">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--glass-border-subtle)] shrink-0">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-canvas)] border border-[var(--glass-border-subtle)]">
            <img
              src="/assets/logo.png"
              alt="Bawaslu"
              className="w-5 h-5 object-contain"
            />
          </div>
          <span className="text-[var(--color-text-primary)] font-bold text-lg font-mono tracking-widest uppercase">
            {siteTitle}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2">
          <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Menu Utama</p>
        </div>

        {links.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                active 
                  ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent-active-text)] font-semibold border border-[var(--color-accent)]/30' 
                  : 'text-[var(--color-text-inverse-muted)] hover:bg-[var(--color-canvas-raised)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {link.icon}
              <span className="text-sm">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[var(--glass-border-subtle)] shrink-0">
        <Link
          href="/"
          onClick={onMobileClose}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-canvas-raised)] hover:text-[var(--color-text-primary)] transition-colors text-sm font-medium"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </aside>
  )
}
