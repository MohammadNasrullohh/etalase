'use client'

import { useState, useEffect, useRef } from 'react'
import { getMeAction, isAdminUser, type LawetUser } from '@/entities/lawet-user'
import { logoutAction } from '../api/login.action'
import { LogIn, LogOut, FileText, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

interface AuthButtonProps {
  initialUser?: LawetUser | null
}

export function AuthButton({ initialUser }: AuthButtonProps = {}) {
  const [user, setUser] = useState<LawetUser | null>(initialUser ?? null)
  const [loading, setLoading] = useState(initialUser === undefined)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialUser !== undefined) return
    getMeAction().then(res => {
      setUser(res)
      setLoading(false)
    })
  }, [initialUser])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-[#FAF7F0] border border-[#E4DDD0] animate-pulse" />
    )
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 px-4 py-2 bg-[#FAF7F0] hover:bg-[#EFEAE0] border border-[#D6CBB5] text-[#1C1815] font-bold rounded-full text-xs transition-all hover:border-[#F5B748] uppercase tracking-wider shadow-sm"
      >
        <LogIn className="w-4 h-4 text-[#D99B26]" />
        <span className="hidden sm:inline">Login</span>
      </Link>
    )
  }

  const initial = user.name.charAt(0).toUpperCase()
  const isAdmin = isAdminUser(user)

  const handleLogout = async () => {
    await logoutAction()
    window.location.reload()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-2 py-1 sm:pr-4 sm:pl-2 rounded-full border border-[#D6CBB5] bg-[#FAF7F0] hover:bg-[#EFEAE0] transition-colors shadow-sm"
      >
        <div className="w-8 h-8 rounded-full bg-[#D99B26] flex items-center justify-center text-[#1C1815] font-bold text-sm">
          {initial}
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-[#1C1815] text-xs font-bold truncate max-w-[100px]">{user.name}</span>
          <span className="text-[#6E6354] text-[10px] uppercase font-mono">{user.role.name}</span>
        </div>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#FFFDF8] border border-[#D6CBB5] rounded-xl shadow-2xl overflow-hidden z-50">
          <Link
            href="/jurnal-saya"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-[#1C1815] hover:bg-[#F4F0E6] transition-colors font-medium"
          >
            <FileText className="w-4 h-4 text-[#D99B26]" />
            Menu Jurnal
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-[#1C1815] hover:bg-[#F4F0E6] transition-colors font-medium"
            >
              <LayoutDashboard className="w-4 h-4 text-[#D99B26]" />
              Dashboard Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-[#C53030] hover:bg-[#FFF5F5] transition-colors font-medium border-t border-[#E4DDD0]"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      )}
    </div>
  )
}
