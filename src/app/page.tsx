import { Suspense } from 'react'
import LandingView from '@/views/landing'
import { getHeroSettings } from '@/entities/site-settings/api/get-site-settings'

export default async function Home() {
  const hero = await getHeroSettings()

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C0C0C] text-[#E2D7D0] flex items-center justify-center font-mono">Loading ALAS...</div>}>
      <LandingView heroImagePath={hero.imagePath} heroTitle={hero.title} heroSubtitle={hero.subtitle} />
    </Suspense>
  )
}
