import { redirect } from 'next/navigation'
import { getAdminUser } from '@/features/admin-auth/lib/require-admin'
import { getHeroSettings } from '@/entities/site-settings/api/get-site-settings'
import { HeroSettingsPanel } from './hero-settings.client'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [admin, hero] = await Promise.all([getAdminUser(), getHeroSettings()])
  if (!admin) redirect('/login')

  return (
    <main className="min-h-screen bg-[#090A0D] text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-[15rem_1fr]">
        <aside className="border-b border-white/10 bg-[#0D0E12] px-6 py-8 lg:border-b-0 lg:border-r">
          <a href="/" className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.12em] text-white hover:text-[#F2613F]">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
              <img src="/assets/logo.png" alt="" className="h-5 w-5 object-contain brightness-0 invert" />
            </span>
            ALAS
          </a>
          <nav className="mt-12">
            <p className="mb-3 text-xs font-medium text-white/45">Pengaturan situs</p>
            <a href="#hero" className="flex items-center rounded-lg bg-[#F2613F]/10 px-3 py-2.5 text-sm font-medium text-[#FF8A6C]">
              Hero beranda
            </a>
          </nav>
          <div className="mt-12 border-t border-white/10 pt-5 text-sm text-white/55">
            <p className="font-medium text-white">{admin.name}</p>
            <p className="mt-1 text-xs">{admin.role.name}</p>
          </div>
        </aside>

        <section className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <p className="text-sm text-[#FF8A6C]">Administrasi</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">Tampilan beranda</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/65">
            Kelola gambar utama yang dilihat publik. Setiap unggahan divalidasi, metadata dihapus, lalu disimpan sebagai WebP yang dioptimalkan.
          </p>
          <HeroSettingsPanel initialImagePath={hero.imagePath} initialUpdatedAt={hero.updatedAt?.toISOString() ?? null} />
        </section>
      </div>
    </main>
  )
}
