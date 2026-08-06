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
      <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
    )
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-sm transition-all hover:border-[var(--color-ember-bright)] uppercase tracking-wider"
      >
        <LogIn className="w-4 h-4 text-[var(--color-ember-bright)]" />
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
        className="flex items-center gap-2 px-2 py-1 sm:pr-4 sm:pl-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
          {initial}
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-white text-xs font-bold truncate max-w-[100px]">{user.name}</span>
          <span className="text-white/50 text-[10px] uppercase">{user.role.name}</span>
        </div>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[var(--color-surface-overlay)] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          <Link
            href="/jurnal-saya"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 transition-colors font-medium"
          >
            <FileText className="w-4 h-4 text-[var(--color-ember-bright)]" />
            Menu Jurnal
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 transition-colors font-medium"
            >
              <LayoutDashboard className="w-4 h-4 text-[var(--color-ember-bright)]" />
              Dashboard Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      )}
    </div>
  )
}
