'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  Home,
  RefreshCw,
  Search,
  Settings,
  TriangleAlert,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'

import { LogoutConfirmDialog } from '@/components/shared/LogoutConfirmDialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatConvertedPrice } from '@/lib/currency'
import { useCurrencyPreference } from '@/lib/hooks/useCurrencyPreference'

type DashboardRole = 'LANDLORD' | 'AGENT'

type SalePropertyItem = {
  _id: string
  status?: string
  basicInformation?: {
    propertyTitle?: string
    details?: string
    propertyType?: { _id?: string; name?: string } | string
    monthlyRent?: number
    preferredCurrency?: string
  }
  location?: {
    streetNumber?: string
    cityTown?: string
    island?: { _id?: string; name?: string } | string | null
  }
  address?: {
    streetNumber?: string
    cityTown?: string
    island?: { _id?: string; name?: string } | string | null
  }
  createdAt?: string
  updatedAt?: string
}

type SalesResponse = {
  status: boolean
  message: string
  data: {
    properties: SalePropertyItem[]
    paginationInfo: {
      currentPage: number
      totalPages: number
      totalData: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
}

type CategoryOption = {
  _id: string
  name: string
  status?: string
}

type IslandOption = {
  _id: string
  name: string
}

const dashboardNavLinks = [
  { label: 'Overview', href: '/dashboard', icon: BarChart3 },
  { label: 'Rentals', href: '/dashboard/rentals', icon: Home },
  { label: 'Sales', href: '/dashboard/sales', icon: BriefcaseBusiness },
  { label: 'Appointments', href: '/dashboard/appointments', icon: CalendarDays },
  { label: 'Inquiries', href: '/dashboard/inquiries', icon: ClipboardList },
  { label: 'Profile', href: '/dashboard/profile', icon: UserRound },
]

const fetchJson = async <T,>(path: string, token?: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  })

  const payload = await response.json()

  if (!response.ok || !payload?.status) {
    throw new Error(payload?.message || 'Request failed')
  }

  return payload as T
}

const getPropertyTypeName = (propertyType?: { _id?: string; name?: string } | string) =>
  typeof propertyType === 'string' ? propertyType : propertyType?.name || 'N/A'

const getLocationLabel = (property: SalePropertyItem) => {
  const source = property.location || property.address
  const island = typeof source?.island === 'object' ? source?.island?.name : source?.island
  return [source?.streetNumber, source?.cityTown, island].filter(Boolean).join(', ') || 'Location not available'
}

const formatDate = (value?: string) => {
  if (!value) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
]

const ALL_FILTER_VALUE = '__all__'

const getStatusBadgeClassName = (status?: string) => {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return 'border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]'
    case 'disabled':
      return 'border-[#FECACA] bg-[#FEF2F2] text-[#B42318]'
    default:
      return 'border-[#D9DBE3] bg-[#F8FAFC] text-[#475467]'
  }
}

const renderPaginationNumbers = (currentPage: number, totalPages: number) => {
  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1])

  return Array.from(pages)
    .filter(page => page >= 1 && page <= totalPages)
    .sort((first, second) => first - second)
}

function DashboardSalesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const token = session?.user?.accessToken
  const { selectedCurrency, rates } = useCurrencyPreference()

  useEffect(() => {
    if (status !== 'authenticated') return
    if (session.user?.role === 'USER') {
      router.replace('/account')
    }
  }, [router, session, status])

  useEffect(() => {
    setSearchInput(searchParams.get('search') || '')
  }, [searchParams])

  const dashboardRole = useMemo(() => {
    const role = session?.user?.role
    return role === 'AGENT' ? 'AGENT' : 'LANDLORD'
  }, [session?.user?.role]) as DashboardRole

  const displayName = session?.user?.name || session?.user?.email || 'Welcome back'
  const page = Number(searchParams.get('page') || '1') || 1
  const limit = 10
  const selectedType = searchParams.get('type') || ''
  const selectedStatus = searchParams.get('status') || ''
  const selectedIsland = searchParams.get('island') || ''

  const createNextUrl = (updates: Record<string, string | number | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key)
        return
      }

      params.set(key, String(value))
    })

    return `/dashboard/sales?${params.toString()}`
  }

  const salesQuery = useQuery({
    queryKey: ['dashboard-sales', token, searchParams.toString()],
    queryFn: () =>
      fetchJson<SalesResponse>(
        `/rental-properties?listingType=buy&page=${page}&limit=${limit}${
          searchParams.get('search') ? `&search=${encodeURIComponent(searchParams.get('search') || '')}` : ''
        }${selectedType ? `&type=${encodeURIComponent(selectedType)}` : ''}${
          selectedStatus ? `&status=${encodeURIComponent(selectedStatus)}` : ''
        }${selectedIsland ? `&island=${encodeURIComponent(selectedIsland)}` : ''}`,
        token,
      ),
    enabled: Boolean(token) && status === 'authenticated',
  })

  const categoriesQuery = useQuery({
    queryKey: ['dashboard-sales-categories'],
    queryFn: () => fetchJson<{ status: boolean; message: string; data: CategoryOption[] }>('/categories', token),
    enabled: Boolean(token) && status === 'authenticated',
  })

  const islandsQuery = useQuery({
    queryKey: ['dashboard-sales-islands'],
    queryFn: () =>
      fetchJson<{ status: boolean; message: string; data: { islands: IslandOption[] } }>(
        '/islands?page=1&limit=100',
        token,
      ),
    enabled: Boolean(token) && status === 'authenticated',
  })

  const properties = salesQuery.data?.data.properties || []
  const paginationInfo = salesQuery.data?.data.paginationInfo
  const categoryOptions = (categoriesQuery.data?.data || []).filter(item => item.status !== 'inactive')
  const islandOptions = (islandsQuery.data?.data?.islands || []).sort((first, second) =>
    first.name.localeCompare(second.name),
  )

  const handleLogout = async () => {
    try {
      setLogoutDialogOpen(false)
      toast.success('Logout successful!')
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Logout failed. Please try again.')
    }
  }

  const handleSearch = () => {
    router.push(createNextUrl({ search: searchInput, page: 1 }))
  }

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-[#f3f5f7]">
        <div className="mx-auto w-full max-w-full">
          <section className="overflow-hidden border border-[#e7eaef] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div className="px-5 py-5 md:px-8 xl:px-16">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-[96px] w-[96px] rounded-[16px]" />
                  <div className="space-y-3">
                    <Skeleton className="h-7 w-36 rounded-[8px]" />
                    <Skeleton className="h-4 w-44 rounded-[8px]" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-10 w-32 rounded-[8px]" />
                  <Skeleton className="h-10 w-28 rounded-[8px]" />
                  <Skeleton className="h-10 w-36 rounded-[8px]" />
                  <Skeleton className="h-10 w-24 rounded-[8px]" />
                </div>
              </div>
            </div>
            <div className="border-y border-[#eef2f6] bg-white px-5 py-4 md:px-8 xl:px-16">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-5 w-24 rounded-[8px]" />
                ))}
              </div>
            </div>
            <div className="space-y-8 bg-[#f8fafc] px-4 py-6 md:px-8 lg:px-12 xl:px-24 xl:py-8 2xl:px-32">
              <Skeleton className="h-9 w-56 rounded-[8px]" />
              <div className="grid gap-4 rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)] md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-11 w-full rounded-[8px]" />
                ))}
              </div>
              <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
                <div className="mb-4 flex items-center justify-between">
                  <Skeleton className="h-6 w-40 rounded-[8px]" />
                  <Skeleton className="h-4 w-24 rounded-[8px]" />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="grid gap-4 border-b border-[#EEF2F6] pb-4 md:grid-cols-[1.7fr_1fr_1.35fr_1fr_1fr_0.9fr_0.95fr]">
                      <Skeleton className="h-10 w-full rounded-[8px]" />
                      <Skeleton className="h-10 w-full rounded-[8px]" />
                      <Skeleton className="h-10 w-full rounded-[8px]" />
                      <Skeleton className="h-10 w-full rounded-[8px]" />
                      <Skeleton className="h-10 w-full rounded-[8px]" />
                      <Skeleton className="h-10 w-24 rounded-[999px]" />
                      <Skeleton className="h-10 w-28 rounded-[8px]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
        <div className="w-full max-w-md rounded-[24px] border border-[#e6e8ec] bg-white p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#98a2b3]">Dashboard</p>
          <h1 className="mt-3 text-2xl font-bold text-[#111827]">Sign in to continue</h1>
          <p className="mt-2 text-sm text-[#667085]">You need an account to access your dashboard.</p>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white"
            style={{
              background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
            }}
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#f3f5f7]">
      <div className="mx-auto w-full max-w-full">
        <section className="overflow-hidden border border-[#e7eaef] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="px-5 py-5 md:px-8 xl:px-16">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-1">
                <div className="relative h-[128px] w-[122px] shrink-0">
                  <Image src="/logo.png" alt="Alora" fill className="object-contain" priority />
                </div>
                <div>
                  <h1 className="text-[24px] font-bold leading-none text-[#111827]">Dashboard</h1>
                  <p className="mt-2 text-sm font-medium text-[#475467]">Welcome back, {displayName}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
                <Link
                  href="/saved"
                  className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#d8e4ec] bg-white px-4 text-sm font-medium text-[#475467] transition-colors hover:bg-[#f8fafc]"
                >
                  <BookOpenCheck className="mr-2 h-4 w-4" />
                  Saved Search
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#d8e4ec] bg-white px-4 text-sm font-medium text-[#475467] transition-colors hover:bg-[#f8fafc]"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
                <Link
                  href="/"
                  className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#d8e4ec] bg-white px-4 text-sm font-medium text-[#475467] transition-colors hover:bg-[#f8fafc]"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Website Home
                </Link>
                <button
                  type="button"
                  onClick={() => setLogoutDialogOpen(true)}
                  className="inline-flex h-10 items-center justify-center rounded-[8px] px-4 text-sm font-medium text-white"
                  style={{
                    background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="border-y border-[#eef2f6] bg-white px-5 py-4 md:px-8 xl:px-16">
            <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {dashboardNavLinks.map(link => {
                const Icon = link.icon
                const isActive = link.href === '/dashboard/sales'

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`inline-flex items-center gap-2 text-[15px] font-medium transition-colors ${
                      isActive ? 'text-[#8BCCE6]' : 'text-[#344054] hover:text-[#111827]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="space-y-8 bg-[#f8fafc] px-4 py-6 md:px-8 lg:px-12 xl:px-24 xl:py-8 2xl:px-32">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-[22px] font-bold text-[#111827]">Sales management</h2>
                <p className="mt-2 text-sm text-[#667085]">
                  Manage your {dashboardRole === 'AGENT' ? 'client' : 'sale'} listings in one place.
                </p>
              </div>
              <Link
                href="/list-property?listingType=buy"
                className="inline-flex h-11 items-center justify-center rounded-[8px] px-5 text-sm font-semibold text-white shadow-sm"
                style={{
                  background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
                }}
              >
                + Add Property for Sale
              </Link>
            </section>

            <section className="grid gap-4 rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)] md:grid-cols-2 xl:grid-cols-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#344054]">Search</span>
                <div className="flex h-11 items-center rounded-[8px] border border-[#D9DBE3] px-3">
                  <Search className="mr-2 h-4 w-4 text-[#98A2B3]" />
                  <input
                    value={searchInput}
                    onChange={event => setSearchInput(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === 'Enter') handleSearch()
                    }}
                    placeholder="Search sales..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#344054]">Island</span>
                <Select
                  value={selectedIsland || ALL_FILTER_VALUE}
                  onValueChange={value =>
                    router.push(createNextUrl({ island: value === ALL_FILTER_VALUE ? null : value, page: 1 }))
                  }
                >
                  <SelectTrigger className="h-11 w-full rounded-[8px] border-[#D9DBE3] bg-white px-3 text-sm text-[#111827]">
                    <SelectValue placeholder="All Islands" />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    className="rounded-[12px] border border-[#E5E7EB] bg-white p-1 shadow-[0_20px_48px_rgba(15,23,42,0.14)]"
                  >
                    <SelectItem value={ALL_FILTER_VALUE}>All Islands</SelectItem>
                    {islandOptions.map(option => (
                      <SelectItem key={option._id} value={option._id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#344054]">Property Type</span>
                <Select
                  value={selectedType || ALL_FILTER_VALUE}
                  onValueChange={value =>
                    router.push(createNextUrl({ type: value === ALL_FILTER_VALUE ? null : value, page: 1 }))
                  }
                >
                  <SelectTrigger className="h-11 w-full rounded-[8px] border-[#D9DBE3] bg-white px-3 text-sm text-[#111827]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    className="rounded-[12px] border border-[#E5E7EB] bg-white p-1 shadow-[0_20px_48px_rgba(15,23,42,0.14)]"
                  >
                    <SelectItem value={ALL_FILTER_VALUE}>All Types</SelectItem>
                    {categoryOptions.map(option => (
                      <SelectItem key={option._id} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#344054]">Status</span>
                <Select
                  value={selectedStatus || ALL_FILTER_VALUE}
                  onValueChange={value =>
                    router.push(createNextUrl({ status: value === ALL_FILTER_VALUE ? null : value, page: 1 }))
                  }
                >
                  <SelectTrigger className="h-11 w-full rounded-[8px] border-[#D9DBE3] bg-white px-3 text-sm text-[#111827]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    className="rounded-[12px] border border-[#E5E7EB] bg-white p-1 shadow-[0_20px_48px_rgba(15,23,42,0.14)]"
                  >
                    {statusOptions.map(option => (
                      <SelectItem key={option.label} value={option.value || ALL_FILTER_VALUE}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <div className="md:col-span-2 xl:col-span-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex h-10 items-center justify-center rounded-[8px] px-4 text-sm font-semibold text-white"
                  style={{
                    background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
                  }}
                >
                  Apply filters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    router.push('/dashboard/sales')
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#D9DBE3] px-4 text-sm font-medium text-[#475467] transition-colors hover:bg-[#F9FAFB]"
                >
                  Reset
                </button>
              </div>
            </section>

            <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">Your sales listings</h3>
                  <p className="text-sm text-[#667085]">
                    {paginationInfo?.totalData || 0} listing{(paginationInfo?.totalData || 0) === 1 ? '' : 's'} found
                  </p>
                </div>
              </div>

              {salesQuery.isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="grid gap-4 border-b border-[#EEF2F6] pb-4 md:grid-cols-[1.7fr_1fr_1.35fr_1fr_1fr_0.9fr_0.95fr]">
                      <Skeleton className="h-10 w-full rounded-[8px]" />
                      <Skeleton className="h-10 w-full rounded-[8px]" />
                      <Skeleton className="h-10 w-full rounded-[8px]" />
                      <Skeleton className="h-10 w-full rounded-[8px]" />
                      <Skeleton className="h-10 w-full rounded-[8px]" />
                      <Skeleton className="h-10 w-24 rounded-[999px]" />
                      <Skeleton className="h-10 w-28 rounded-[8px]" />
                    </div>
                  ))}
                </div>
              ) : salesQuery.isError ? (
                <div className="flex flex-col items-center justify-center rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-12 text-center">
                  <TriangleAlert className="h-10 w-10 text-[#E53935]" />
                  <h4 className="mt-4 text-xl font-bold text-[#111827]">Couldn&apos;t load sales listings</h4>
                  <p className="mt-2 max-w-md text-sm text-[#667085]">
                    {salesQuery.error instanceof Error
                      ? salesQuery.error.message
                      : 'Something went wrong while loading your sales listings.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => salesQuery.refetch()}
                    className="mt-5 inline-flex h-10 items-center justify-center rounded-[8px] border border-[#D9DBE3] px-4 text-sm font-medium text-[#475467] transition-colors hover:bg-[#F9FAFB]"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try again
                  </button>
                </div>
              ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-[#FBFCFD] px-6 py-14 text-center">
                  <Home className="h-10 w-10 text-[#667085]" />
                  <h4 className="mt-4 text-[32px] font-bold leading-tight text-[#334155]">
                    No properties for sale found
                  </h4>
                  <p className="mt-3 max-w-md text-base text-[#667085]">
                    Add your first property for sale to get started
                  </p>
                  <Link
                    href="/list-property?listingType=buy"
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-[8px] px-5 text-sm font-semibold text-white"
                    style={{
                      background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
                    }}
                  >
                    + Add Property for Sale
                  </Link>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#EEF2F6] hover:bg-transparent">
                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">Property</TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">Type</TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">Location</TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">Price</TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">Updated</TableHead>
                        <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">Status</TableHead>
                        <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map(property => (
                        <TableRow key={property._id} className="border-b border-[#F2F4F7]">
                          <TableCell className="px-4 py-4 align-top">
                            <div className="min-w-[220px]">
                              <p className="font-semibold text-[#111827]">
                                {property.basicInformation?.propertyTitle || 'Untitled property'}
                              </p>
                              <p className="mt-1 max-w-[260px] truncate text-sm text-[#667085]">
                                {property.basicInformation?.details || 'No details provided'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 text-sm text-[#475467]">
                            {getPropertyTypeName(property.basicInformation?.propertyType)}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-sm text-[#475467]">{getLocationLabel(property)}</TableCell>
                          <TableCell className="px-4 py-4 text-sm font-semibold text-[#111827]">
                            {formatConvertedPrice(
                              property.basicInformation?.monthlyRent,
                              property.basicInformation?.preferredCurrency,
                              selectedCurrency,
                              rates,
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-sm text-[#475467]">
                            {formatDate(property.updatedAt || property.createdAt)}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-sm text-[#475467]">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadgeClassName(
                                property.status,
                              )}`}
                            >
                              {property.status || 'Unknown'}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/list-property?id=${property._id}&listingType=buy`}
                                className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#D9DBE3] px-4 text-sm font-medium text-[#475467] transition-colors hover:bg-[#F9FAFB]"
                              >
                                Edit
                              </Link>
                              <Link
                                href={`/buy/${property._id}`}
                                className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#D9DBE3] px-4 text-sm font-medium text-[#475467] transition-colors hover:bg-[#F9FAFB]"
                              >
                                View
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {paginationInfo && paginationInfo.totalPages > 1 ? (
                    <div className="mt-6 flex flex-col gap-3 border-t border-[#EEF2F6] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-[#667085]">
                        Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
                      </p>
                      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href={createNextUrl({ page: page - 1 })}
                              className={!paginationInfo.hasPrevPage ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                          {renderPaginationNumbers(
                            paginationInfo.currentPage,
                            paginationInfo.totalPages,
                          ).map(pageNumber => (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                href={createNextUrl({ page: pageNumber })}
                                isActive={pageNumber === paginationInfo.currentPage}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              href={createNextUrl({ page: page + 1 })}
                              className={!paginationInfo.hasNextPage ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          </div>
        </section>
      </div>

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
      />
    </main>
  )
}

export default function DashboardSalesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f5f7]" />}>
      <DashboardSalesPageContent />
    </Suspense>
  )
}
