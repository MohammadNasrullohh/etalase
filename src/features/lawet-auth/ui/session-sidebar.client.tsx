'use client'

import { LawetUser, logoutAction } from '../api/get-me.action'
import { X, FileText, Folder, CheckSquare, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  user: LawetUser
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ user, isOpen, onClose }: Props) {
  const router = useRouter()
  const isApprover = user.role.level >= 2

  const handleLogout = async () => {
    await logoutAction()
    window.location.reload()
  }

  const navigate = (path: string) => {
    router.push(path)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-[300px] sm:w-[350px] bg-[#0C0C0C] border-l border-white/10 shadow-2xl z-[100] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-white font-bold">{user.name}</h3>
              <p className="text-white/50 text-xs uppercase tracking-wider font-mono mt-1">{user.role.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          
          <button 
            onClick={() => navigate('/pengajuan')}
            className="w-full flex items-center gap-4 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--color-ember-bright)]/10 text-[var(--color-ember-bright)] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide">Tambah Jurnal</div>
              <div className="text-xs text-white/40 mt-0.5">Buat pengajuan jurnal baru</div>
            </div>
          </button>

          <button 
            onClick={() => navigate('/jurnal-saya')}
            className="w-full flex items-center gap-4 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide">Jurnal Saya</div>
              <div className="text-xs text-white/40 mt-0.5">Lihat status jurnal Anda</div>
            </div>
          </button>

          {isApprover && (
            <button 
              onClick={() => navigate('/approval')}
              className="w-full flex items-center gap-4 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm tracking-wide">Approval</div>
                <div className="text-xs text-white/40 mt-0.5">Persetujuan draft jurnal staf</div>
              </div>
            </button>
          )}
          
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors font-bold text-sm tracking-wider uppercase"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </div>
    </>
  )
}
