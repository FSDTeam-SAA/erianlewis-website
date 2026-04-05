import type { Metadata } from 'next'
import React from 'react'
import FavoritesContainer from './_components/favorite-container'
import { createMetadata } from '@/lib/seo'

export const metadata: Metadata = createMetadata({
  title: 'Favorite Properties',
  description: 'Review your saved favorite properties on Alora.',
  path: '/favorites',
  noIndex: true,
})
export const dynamic = 'force-dynamic'

const FavoritesPage = () => {
  return (
    <div>
        <FavoritesContainer/>
    </div>
  )
}

export default FavoritesPage
