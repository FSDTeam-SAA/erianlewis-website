'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CategoryCard } from './CategoryCard'
import { StatCard } from './StatCard'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building,
  Home,
  Hotel,
  House,
  Castle,
  Map,
  Store,
  Sparkles,
  BarChart2,
  Users,
  Building2,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface DashboardStatsResponse {
  totalSiteVisits: number
  totalUsers: number
  totalListings: number
  categories: Array<{
    _id: string
    name: string
    status: string
  }>
}

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  apartment: Building,
  home: Home,
  condo: Hotel,
  townhouse: House,
  villa: Castle,
  land: Map,
  commercial: Store,
  'new listing': Sparkles,
}

const formatStatValue = (value?: number) => {
  if (typeof value !== 'number') return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

const fetchDashboardStats = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/stats`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  )

  const payload = await response.json()

  if (!response.ok || !payload?.status || !payload?.data) {
    throw new Error(payload?.message || 'Failed to load landing page stats')
  }

  return payload.data as DashboardStatsResponse
}

function StatCardSkeleton() {
  return <Skeleton className="min-h-[130px] rounded-2xl" />
}

function CategoryCardSkeleton() {
  return <Skeleton className="h-[160px] rounded-2xl" />
}

export function BrowseByCategory() {
  const [activeTab, setActiveTab] = useState<'Rent' | 'Buy'>('Rent')
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  })

  const categories = useMemo(() => {
    return (data?.categories || []).map(category => ({
      id: category._id,
      label: category.name,
      icon: CATEGORY_ICON_MAP[category.name.toLowerCase()] || Building,
      href: `/${activeTab === 'Rent' ? 'rentals' : 'buy'}?type=${encodeURIComponent(category._id)}`,
    }))
  }, [activeTab, data?.categories])

  return (
    <section className="relative z-20 min-h-[500px] w-full bg-transparent pt-1 pb-24">
      {/* Overlapping Stat Cards mapped according to exact specs */}
      <div className="bg-transparent">
        <div className="relative z-30 mt-5 mb-0 w-full px-4">
          <div className="max-w-5xl mx-auto  pt-[24px] px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {isLoading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <StatCard
                    title="Total Site Visits"
                    value={formatStatValue(data?.totalSiteVisits)}
                    subtitle="All-time"
                    icon={BarChart2}
                    gradient="linear-gradient(102.89deg, #80BDEA 0%, #4E8BE3 100%)"
                  />
                  <StatCard
                    title="Registered User"
                    value={formatStatValue(data?.totalUsers)}
                    subtitle="Tenants + Landlords + Agents"
                    icon={Users}
                    gradient="linear-gradient(102.89deg, #FF7D51 0%, #FF6C69 100%)"
                  />
                  <StatCard
                    title="Total Listings"
                    value={formatStatValue(data?.totalListings)}
                    subtitle="All-time"
                    icon={Building2}
                    gradient="linear-gradient(102.89deg, #2B3D4F 0%, #203041 100%)"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl bg-transparent px-6 py-6 pt-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 text-gray-900 tracking-tight drop-shadow-sm">
          Browse By Category
        </h2>

        <div className="flex justify-center mb-16 ">
          <div className="flex backdrop-blur-md shadow-sm border border-white/40 p-1.5 rounded-2xl max-w-xs w-full">
            <button
              onClick={() => setActiveTab('Rent')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all text-sm shadow-sm ${activeTab === 'Rent' ? 'text-white cursor-default' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 bg-transparent'}`}
              style={{
                background:
                  activeTab === 'Rent'
                    ? 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)'
                    : 'transparent',
              }}
            >
              Rent
            </button>
            <button
              onClick={() => setActiveTab('Buy')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all text-sm shadow-sm ${activeTab === 'Buy' ? 'text-white cursor-default' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 bg-transparent'}`}
              style={{
                background:
                  activeTab === 'Buy'
                    ? 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)'
                    : 'transparent',
              }}
            >
              Buy
            </button>
          </div>
        </div>

        {isError ? (
          <div className="rounded-[28px] border border-[#f3c7ba] bg-white/70 px-6 py-10 text-center shadow-sm backdrop-blur-sm">
            <TriangleAlert className="mx-auto mb-4 h-10 w-10 text-[#f6855c]" />
            <h3 className="text-xl font-semibold text-[#202124]">
              Something went wrong
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#5f6368]">
              {error instanceof Error
                ? error.message
                : 'We could not load the latest stats and categories.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mx-auto mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#202124] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 justify-center gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-5 lg:gap-8">
            {Array.from({ length: 5 }).map((_, index) => (
              <CategoryCardSkeleton key={index} />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8 justify-center">
            {categories.map(cat => (
              <CategoryCard
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                href={cat.href}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/50 bg-white/40 px-6 py-10 text-center shadow-sm backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-[#202124]">
              No categories found
            </h3>
            <p className="mt-2 text-sm text-[#5f6368]">
              Categories are not available right now. Please check back again
              soon.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
