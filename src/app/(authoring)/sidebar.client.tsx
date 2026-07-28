'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Folder, CheckSquare, Home, LayoutDashboard } from 'lucide-react'

interface Props {
  isApprover: boolean
  isAdmin: boolean
  onMobileClose?: () => void
}

export function AuthoringSidebarClient({ isApprover, isAdmin, onMobileClose }: Props) {
  const pathname = usePathname()

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
    <aside className="w-[280px] h-full bg-[#111] lg:border-r border-white/10 flex flex-col">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10">
            <img
              src="/assets/logo.png"
              alt="Bawaslu"
              className="w-5 h-5 object-contain filter brightness-0 invert"
            />
          </div>
          <span className="text-white font-bold text-lg font-mono tracking-widest uppercase">
            ΛLΛS
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Menu Utama</p>
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
                  ? 'bg-[var(--color-ember-bright)]/10 text-[var(--color-ember-bright)] font-semibold' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.icon}
              <span className="text-sm">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10 shrink-0">
        <Link
          href="/"
          onClick={onMobileClose}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white/50 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </aside>
  )
}
