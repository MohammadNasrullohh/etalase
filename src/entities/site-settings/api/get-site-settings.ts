import { eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { siteSettings } from '../../../../drizzle/schema'
import { db } from '@/shared/lib/db'
import { DEFAULT_HERO_TITLE } from '../lib/hero-title'
import { DEFAULT_HERO_SUBTITLE } from '../lib/hero-subtitle'

export const DEFAULT_HERO_IMAGE_PATH = '/assets/banner-image.webp'
export { DEFAULT_HERO_TITLE }

export type HeroSettings = {
  imagePath: string
  title: string
  subtitle: string
  updatedAt: Date | null
}

const getCachedHeroSettings = unstable_cache(async (): Promise<HeroSettings> => {
  try {
    const [settings] = await db
      .select({
        heroImagePath: siteSettings.hero_image_path,
        heroTitle: siteSettings.hero_title,
        heroSubtitle: siteSettings.hero_subtitle,
        updatedAt: siteSettings.updated_at,
      })
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1)

    return {
      imagePath: settings?.heroImagePath || DEFAULT_HERO_IMAGE_PATH,
      title: settings?.heroTitle || DEFAULT_HERO_TITLE,
      subtitle: settings?.heroSubtitle || DEFAULT_HERO_SUBTITLE,
      updatedAt: settings?.updatedAt ? new Date(settings.updatedAt) : null,
    }
  } catch (error) {
    console.warn('Failed to fetch hero settings from database, using defaults.', error)
    return {
      imagePath: DEFAULT_HERO_IMAGE_PATH,
      title: DEFAULT_HERO_TITLE,
      subtitle: DEFAULT_HERO_SUBTITLE,
      updatedAt: null,
    }
  }
}, ['site-settings', 'hero'], { revalidate: 3600, tags: ['site-settings'] })

export async function getHeroSettings(): Promise<HeroSettings> {
  return getCachedHeroSettings()
}
