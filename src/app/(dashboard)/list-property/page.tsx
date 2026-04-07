import { Suspense } from 'react'

import ListPropertyPageClient from './_components/ListPropertyPageClient'

export default function ListPropertyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F8FA]" />}>
      <ListPropertyPageClient />
    </Suspense>
  )
}
