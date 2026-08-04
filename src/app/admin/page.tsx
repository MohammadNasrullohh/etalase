import { redirect } from 'next/navigation'
import { getAdminUser } from '@/features/admin-auth/lib/require-admin'
import { getHeroSettings } from '@/entities/site-settings/api/get-site-settings'
import { HeroSettingsPanel } from './hero-settings.client'
import { HeroSubtitleSettingsPanel } from './hero-subtitle-settings.client'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [admin, hero] = await Promise.all([getAdminUser(), getHeroSettings()])
  if (!admin) redirect('/login')

  return (
    <section className="min-h-full bg-[var(--color-canvas-raised)] px-5 py-8 text-[var(--color-text-primary)] sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-[var(--color-accent-hover)]">Administrasi</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">Tampilan beranda</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-white/65">
          Kelola judul, subtitle, dan gambar utama yang dilihat publik. Setiap unggahan divalidasi, metadata dihapus, lalu disimpan sebagai WebP yang dioptimalkan.
        </p>
        <HeroSubtitleSettingsPanel initialSubtitle={hero.subtitle} />
        <HeroSettingsPanel initialImagePath={hero.imagePath} initialTitle={hero.title} initialUpdatedAt={hero.updatedAt?.toISOString() ?? null} />
      </div>
    </section>
  )
}
