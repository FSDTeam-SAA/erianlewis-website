import { notFound } from 'next/navigation'

type DashboardSubpageProps = {
  params: {
    slug: string
  }
}

export default function DashboardSubpage({ params }: DashboardSubpageProps) {
  void params.slug
  notFound()
}
