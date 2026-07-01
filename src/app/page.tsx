import { Suspense } from 'react'
import LandingView from '@/views/landing'

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C0C0C] text-[#E2D7D0] flex items-center justify-center font-mono">Loading ALAS...</div>}>
      <LandingView />
    </Suspense>
  )
}

