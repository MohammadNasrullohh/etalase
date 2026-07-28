import { redirect } from 'next/navigation'
import { getAdminUser } from '@/features/admin-auth/lib/require-admin'
import { getHeroSettings } from '@/entities/site-settings/api/get-site-settings'
import { HeroSettingsPanel } from './hero-settings.client'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [admin, hero] = await Promise.all([getAdminUser(), getHeroSettings()])
  if (!admin) redirect('/login')

  return (
    <section className="min-h-full bg-[#090A0D] px-5 py-8 text-white sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-[#FF8A6C]">Administrasi</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">Tampilan beranda</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-white/65">
          Kelola gambar utama yang dilihat publik. Setiap unggahan divalidasi, metadata dihapus, lalu disimpan sebagai WebP yang dioptimalkan.
        </p>
        <HeroSettingsPanel initialImagePath={hero.imagePath} initialUpdatedAt={hero.updatedAt?.toISOString() ?? null} />
      </div>
    </section>
  )
}
