import type { Metadata } from 'next'
import { Navbar } from '@/components/shared/Navbar'
import { HeroSection } from '@/components/shared/HeroSection'
import { BrowseByCategory } from '@/components/shared/BrowseByCategory'
import { Footer } from '@/components/shared/Footer'
import { createMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createMetadata({
  title: 'Alora Real Estate & Rentals',
  description:
    'Explore rentals, homes for sale, and property opportunities with Alora.',
  path: '/',
  keywords: ['Alora homes', 'Alora rentals', 'property search'],
})

async function recordVisit() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/visit`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch {
    // Ignore analytics failures so the landing page can still render.
  }
}

export default async function TenantHomepage() {
  await recordVisit()

  return (
    <main className="min-h-screen flex flex-col font-sans relative bg-[#F9FAFB]">
      <Navbar />
      <HeroSection />
      <BrowseByCategory />
      <Footer />
    </main>
  )
}
