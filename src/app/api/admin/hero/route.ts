import { randomUUID } from 'crypto'
import { mkdir, rm } from 'fs/promises'
import path from 'path'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { eq } from 'drizzle-orm'
import { getAdminUser } from '@/features/admin-auth/lib/require-admin'
import { siteSettings } from '../../../../../drizzle/schema'
import { db } from '@/shared/lib/db'
import { hasSameOrigin } from '@/shared/lib/security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024
const MAX_INPUT_PIXELS = 32_000_000
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif'])

function heroDirectory(): string {
  return path.resolve(
    process.env.HERO_UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads', 'hero'),
  )
}

function isManagedHeroPath(imagePath: string | null | undefined): imagePath is string {
  return Boolean(imagePath && /^\/uploads\/hero\/hero-[a-f0-9-]+\.webp$/.test(imagePath))
}

export async function POST(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ status: 'error', message: 'forbidden' }, { status: 403 })
  }

  if (!hasSameOrigin(request)) {
    return NextResponse.json({ status: 'error', message: 'invalid origin' }, { status: 403 })
  }

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_UPLOAD_BYTES + 32_768) {
    return NextResponse.json({ status: 'error', message: 'file terlalu besar (maksimum 8 MB)' }, { status: 413 })
  }

  let outputPath: string | null = null
  let persisted = false

  try {
    const formData = await request.formData()
    const file = formData.get('image')
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ status: 'error', message: 'pilih gambar terlebih dahulu' }, { status: 422 })
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ status: 'error', message: 'file terlalu besar (maksimum 8 MB)' }, { status: 413 })
    }

    const input = Buffer.from(await file.arrayBuffer())
    const source = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'error' })
    const metadata = await source.metadata()
    if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format) || !metadata.width || !metadata.height) {
      return NextResponse.json({ status: 'error', message: 'gunakan gambar JPEG, PNG, WebP, atau AVIF yang valid' }, { status: 422 })
    }

    const directory = heroDirectory()
    await mkdir(directory, { recursive: true })
    const fileName = `hero-${randomUUID()}.webp`
    outputPath = path.join(directory, fileName)

    // Re-encode menghapus metadata/EXIF, membatasi dimensi, dan membuat aset web yang konsisten.
    await source
      .rotate()
      .resize({ width: 1920, height: 1080, fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4, smartSubsample: true })
      .toFile(outputPath)

    const imagePath = `/uploads/hero/${fileName}`
    const [previous] = await db
      .select({ heroImagePath: siteSettings.hero_image_path })
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1)

    await db
      .insert(siteSettings)
      .values({ id: 1, hero_image_path: imagePath, updated_at: new Date() })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { hero_image_path: imagePath, updated_at: new Date() },
      })
    persisted = true

    // Hapus versi lama hanya setelah konfigurasi baru tersimpan dengan sukses.
    if (isManagedHeroPath(previous?.heroImagePath)) {
      await rm(path.join(directory, path.basename(previous.heroImagePath)), { force: true })
        .catch((error) => console.warn('Could not remove the previous hero image', error))
    }

    revalidateTag('site-settings')
    revalidatePath('/')

    return NextResponse.json({
      status: 'ok',
      data: { imagePath, uploadedBy: admin.username },
    }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    if (outputPath && !persisted) await rm(outputPath, { force: true }).catch(() => undefined)
    console.error('Hero upload failed', error)
    return NextResponse.json({ status: 'error', message: 'gagal memproses gambar hero' }, { status: 500 })
  }
}
