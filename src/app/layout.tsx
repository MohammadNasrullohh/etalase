import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getHeroSettings } from '@/entities/site-settings/api/get-site-settings'
import { SiteTitleProvider } from '@/entities/site-settings/ui/site-title.client'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const { title } = await getHeroSettings()

  return {
    title: `${title} — Arsip Langkah Bawaslu Kebumen`,
    description: 'Portal arsip publik read-only untuk kegiatan dan pimpinan Bawaslu Kebumen.',
    icons: {
      icon: '/assets/logo.png',
      shortcut: '/assets/logo.png',
      apple: '/assets/logo.png',
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { title } = await getHeroSettings()

  return (
    <html lang="id">
      <body className={inter.className}>
        <SiteTitleProvider title={title}>{children}</SiteTitleProvider>
      </body>
    </html>
  )
}
