'use client'
import { useState, FormEvent, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, ChevronRight, Delete } from 'lucide-react'
import { loginAction } from '../api/login.action'
import { useSiteTitle } from '@/entities/site-settings/ui/site-title.client'

export function LoginForm() {
  const router = useRouter()
  const siteTitle = useSiteTitle()
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const executeLogin = useCallback(async (usr: string, code: string) => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const res = await loginAction(usr, code)
      if (res.success) {
        // Assume user object has is_superadmin or can_approve
        if (res.user?.can_approve) {
          router.push('/approval')
        } else {
          router.push('/pengajuan')
        }
      } else {
        setPin('')
        setErrorMsg(res.error || 'Login gagal')
      }
    } catch (err: any) {
      setPin('')
      setErrorMsg('Koneksi terputus')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleNumber = useCallback((num: string) => {
    if (isLoading) return
    if (pin.length >= 4) return
    const nextPin = pin + num
    setPin(nextPin)
    if (nextPin.length === 4) {
      executeLogin(username, nextPin)
    }
  }, [username, executeLogin, isLoading, pin])

  const handleBackspace = useCallback(() => {
    if (isLoading) return
    setPin((prev) => prev.slice(0, -1))
  }, [isLoading])

  useEffect(() => {
    if (step !== 2) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        handleNumber(e.key)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        handleBackspace()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step, handleNumber, handleBackspace])

  function handleNext(e: FormEvent) {
    e.preventDefault()
    if (!username.trim()) {
      setErrorMsg('Masukkan username Anda')
      return
    }
    setErrorMsg('')
    setStep(2)
  }

  return (
    <div className="relative w-full max-w-sm mx-auto glass-surface rounded-2xl p-8 border border-white/10 z-10">
      {errorMsg && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-xs font-mono text-center">
          {errorMsg}
        </div>
      )}

      {step === 1 ? (
        <div className="animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white tracking-widest font-mono mb-2">OTORISASI</h3>
            <p className="text-sm text-gray-400">Sistem Pengajuan & Approval {siteTitle}</p>
          </div>

          <form onSubmit={handleNext} className="space-y-6">
            <div>
              <label htmlFor="login-username" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
                ID PENGGUNA
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                <input
                  id="login-username"
                  type="text"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[var(--color-ember-bright)] transition-colors"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--color-ember-bright)] text-black font-bold py-3 px-4 rounded-xl hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer font-mono text-xs uppercase tracking-wider"
            >
              Lanjutkan <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-4 fade-in duration-300 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-8">
            <button
              onClick={() => {
                setStep(1)
                setPin('')
                setErrorMsg('')
              }}
              className="text-xs font-mono font-bold text-gray-400 hover:text-white py-1 px-2 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> KEMBALI
            </button>
            <span className="text-[10px] font-mono text-[var(--color-ember-bright)] bg-[var(--color-ember-bright)]/10 py-1 px-2.5 rounded-full flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{username}</span>
            </span>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white tracking-widest font-mono mb-2">PIN AKSES</h3>
            <p className="text-sm text-gray-400">Masukkan 4 digit PIN keamanan</p>
          </div>

          <div className="flex justify-center gap-4 my-4 py-4 px-6 bg-black/30 rounded-2xl border border-white/5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${pin.length > i
                  ? 'bg-[var(--color-ember-bright)] shadow-[0_0_10px_var(--color-ember-bright)] scale-110'
                  : 'bg-gray-800'
                  }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-y-3 gap-x-4 justify-items-center w-full max-w-[240px] mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumber(String(num))}
                disabled={isLoading}
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[var(--color-ember-bright)]/50 active:scale-95 disabled:opacity-40 transition-all cursor-pointer font-mono"
              >
                {num}
              </button>
            ))}
            <div />
            <button
              type="button"
              onClick={() => handleNumber('0')}
              disabled={isLoading}
              className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[var(--color-ember-bright)]/50 active:scale-95 disabled:opacity-40 transition-all cursor-pointer font-mono"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              disabled={isLoading || pin.length === 0}
              className="w-14 h-14 rounded-full flex items-center justify-center text-gray-400 hover:text-white active:scale-90 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Delete className="w-5.5 h-5.5" />
            </button>
          </div>

          {isLoading && (
            <div className="mt-6 text-xs font-mono text-[var(--color-ember-bright)] animate-pulse uppercase tracking-widest">
              Memverifikasi...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
