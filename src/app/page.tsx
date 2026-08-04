import { Suspense } from 'react'
import LandingView from '@/views/landing'
import { getHeroSettings } from '@/entities/site-settings/api/get-site-settings'

export default async function Home() {
  const hero = await getHeroSettings()

  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-ink)] text-[var(--color-text-inverse-muted)] flex items-center justify-center font-mono">Memuat beranda...</div>}>
      <LandingView heroImagePath={hero.imagePath} heroTitle={hero.title} heroSubtitle={hero.subtitle} />
    </Suspense>
  )
}
