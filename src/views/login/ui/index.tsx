import { LoginForm } from '@/features/lawet-auth/ui/login-form.client'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { SiteTitle } from '@/entities/site-settings/ui/site-title.client'

export function LoginView() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Back to Home Button */}
      <Link 
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors text-xs font-mono font-bold tracking-wider uppercase bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-overlay)] px-4 py-2 rounded-full border border-[var(--glass-border-default)] shadow-sm backdrop-blur-sm"
      >
        <Home className="w-4 h-4" />
        Beranda
      </Link>

      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[var(--color-accent)]/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Branding */}
        <div className="hidden md:block">
          <h1 className="text-4xl font-black text-[var(--color-text-primary)] font-mono tracking-tighter mb-4">
            <SiteTitle /> <span className="text-[var(--color-category-amber)]">AUTHORING</span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed max-w-md">
            Portal otentikasi terpadu internal. Segala proses pengajuan dan persetujuan akan diproses sesuai standar tata kelola Bawaslu Kebumen.
          </p>
          <div className="mt-8 flex gap-4">
            <div className="px-3 py-1 border border-[var(--color-accent)]/40 text-[var(--color-accent-active-text)] bg-[var(--color-accent)]/15 text-[10px] font-mono tracking-widest uppercase rounded-full">
              Secured Connection
            </div>
            <div className="px-3 py-1 border border-[var(--glass-border-default)] text-[var(--color-text-muted)] bg-[var(--color-surface-raised)] text-[10px] font-mono tracking-widest uppercase rounded-full">
              Portal Terintegrasi
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
