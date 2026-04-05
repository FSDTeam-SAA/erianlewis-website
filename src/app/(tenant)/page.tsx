import type { Metadata } from 'next'
import { Navbar } from '@/components/shared/Navbar'
import { HeroSection } from '@/components/shared/HeroSection'
import { BrowseByCategory } from '@/components/shared/BrowseByCategory'
import { Footer } from '@/components/shared/Footer'
import { createMetadata } from '@/lib/seo'

export const metadata: Metadata = createMetadata({
  title: 'Alora Real Estate & Rentals',
  description:
    'Explore rentals, homes for sale, and property opportunities with Alora.',
  path: '/',
  keywords: ['Alora homes', 'Alora rentals', 'property search'],
})

export default function TenantHomepage() {
  return (
    <main className="min-h-screen flex flex-col font-sans relative bg-[#F9FAFB]">
      <Navbar />
      <HeroSection />
      <BrowseByCategory />
      <Footer />
    </main>
  )
}
