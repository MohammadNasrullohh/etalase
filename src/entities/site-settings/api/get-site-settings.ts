import { eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { siteSettings } from '../../../../drizzle/schema'
import { db } from '@/shared/lib/db'

export const DEFAULT_HERO_IMAGE_PATH = '/assets/banner-image.webp'

export type HeroSettings = {
  imagePath: string
  updatedAt: Date | null
}

const getCachedHeroSettings = unstable_cache(async (): Promise<HeroSettings> => {
  const [settings] = await db
    .select({
      heroImagePath: siteSettings.hero_image_path,
      updatedAt: siteSettings.updated_at,
    })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1)

  return {
    imagePath: settings?.heroImagePath || DEFAULT_HERO_IMAGE_PATH,
    updatedAt: settings?.updatedAt ?? null,
  }
}, ['site-settings', 'hero'], { revalidate: 3600, tags: ['site-settings'] })

export async function getHeroSettings(): Promise<HeroSettings> {
  return getCachedHeroSettings()
}
