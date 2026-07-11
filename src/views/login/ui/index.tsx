import { LoginForm } from '@/features/lawet-auth/ui/login-form.client'
import Link from 'next/link'
import { Home } from 'lucide-react'

export function LoginView() {
  return (
    <div className="min-h-screen bg-[var(--color-base)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Back to Home Button */}
      <Link 
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-mono font-bold tracking-wider uppercase bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm"
      >
        <Home className="w-4 h-4" />
        Beranda
      </Link>

      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-ember-bright)]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[var(--color-ember-bright)]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Branding */}
        <div className="hidden md:block">
          <h1 className="text-4xl font-black text-white font-mono tracking-tighter mb-4">
            ALAS <span className="text-[var(--color-ember-bright)]">AUTHORING</span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md">
            Portal ini terhubung langsung secara aman dengan sistem otentikasi Lawet Hub. Segala proses pengajuan dan persetujuan akan diproses sesuai standar berlapis Bawaslu Kebumen.
          </p>
          <div className="mt-8 flex gap-4">
            <div className="px-3 py-1 border border-[var(--color-ember-bright)]/30 text-[var(--color-ember-bright)] text-[10px] font-mono tracking-widest uppercase rounded-full">
              Secured Connection
            </div>
            <div className="px-3 py-1 border border-white/10 text-gray-400 text-[10px] font-mono tracking-widest uppercase rounded-full">
              Lawet Hub API
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex justify-center md:justify-end w-full">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
