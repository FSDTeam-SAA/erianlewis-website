'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  Filter,
  Home,
  Mail,
  RefreshCw,
  Settings,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'

import { LogoutConfirmDialog } from '@/components/shared/LogoutConfirmDialog'
import { SearchableSelect } from '@/components/shared/SearchableSelect'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

type InquiryStatus = 'new' | 'replied' | 'closed'
type DashboardRole = 'LANDLORD' | 'AGENT'

type InquiryItem = {
  _id: string
  property?: {
    _id?: string
    basicInformation?: {
      propertyTitle?: string
    }
    location?: {
      island?: string
    }
    photos?: Array<{
      url?: string
    }>
  }
  fullName?: string
  email?: string
  phone?: string
  message?: string
  status?: InquiryStatus
  replies?: Array<{
    _id?: string
    message?: string
    repliedAt?: string
  }>
  createdAt?: string
  updatedAt?: string
}

type InquiriesResponse = {
  status: boolean
  message: string
  data: {
    inquiries: InquiryItem[]
    paginationInfo: {
      currentPage: number
      totalPages: number
      totalData: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
}

const dashboardNavLinks = [
  { label: 'Overview', href: '/dashboard', icon: BarChart3 },
  { label: 'Rentals', href: '/dashboard/rentals', icon: Home },
  { label: 'Sales', href: '/dashboard/sales', icon: BriefcaseBusiness },
  {
    label: 'Appointments',
    href: '/dashboard/appointments',
    icon: CalendarDays,
  },
  { label: 'Inquiries', href: '/dashboard/inquiries', icon: ClipboardList },
  { label: 'Profile', href: '/dashboard/profile', icon: UserRound },
]

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
]

const fetchJson = async <T,>(path: string, token?: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    },
  )

  const payload = await response.json()

  if (!response.ok || !payload?.status) {
    throw new Error(payload?.message || 'Request failed')
  }

  return payload as T
}

const formatDate = (value?: string) => {
  if (!value) return 'N/A'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

const statusBadgeClassName: Record<string, string> = {
  new: 'border-[#FDE68A] bg-[#FFF9E6] text-[#B54708]',
  replied: 'border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]',
  closed: 'border-[#D0D5DD] bg-[#F8FAFC] text-[#475467]',
}

const renderPaginationNumbers = (currentPage: number, totalPages: number) => {
  const pages = new Set<number>([
    1,
    totalPages,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ])

  return Array.from(pages)
    .filter(page => page >= 1 && page <= totalPages)
    .sort((first, second) => first - second)
}

function DashboardInquiriesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const token = session?.user?.accessToken

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [activeInquiry, setActiveInquiry] = useState<InquiryItem | null>(null)
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    if (status !== 'authenticated') return

    if (session.user?.role === 'USER') {
      router.replace('/account')
    }
  }, [router, session, status])

  const dashboardRole = useMemo(() => {
    const role = session?.user?.role
    return role === 'AGENT' ? 'AGENT' : 'LANDLORD'
  }, [session?.user?.role]) as DashboardRole

  const displayName =
    session?.user?.name || session?.user?.email || 'Welcome back'
  const page = Number(searchParams.get('page') || '1') || 1
  const limit = 10
  const selectedStatus = searchParams.get('status') || 'all'
  const selectedProperty = searchParams.get('property') || 'all'
  const selectedSort = searchParams.get('sort') || 'newest'

  const createNextUrl = (
    updates: Record<string, string | number | null | undefined>,
  ) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all') {
        params.delete(key)
        return
      }

      params.set(key, String(value))
    })

    return `/dashboard/inquiries?${params.toString()}`
  }

  const inquiriesQuery = useQuery({
    queryKey: ['dashboard-inquiries', token, page, selectedStatus],
    queryFn: () =>
      fetchJson<InquiriesResponse>(
        `/inquiries?page=${page}&limit=${limit}${
          selectedStatus !== 'all' ? `&status=${selectedStatus}` : ''
        }`,
        token,
      ),
    enabled: Boolean(token) && status === 'authenticated',
  })

  const inquiries = useMemo(
    () => inquiriesQuery.data?.data.inquiries || [],
    [inquiriesQuery.data?.data.inquiries],
  )
  const paginationInfo = inquiriesQuery.data?.data.paginationInfo

  const propertyOptions = useMemo(() => {
    const seen = new Map<string, string>()

    inquiries.forEach(inquiry => {
      if (!inquiry.property?._id) return

      seen.set(
        inquiry.property._id,
        inquiry.property.basicInformation?.propertyTitle || 'Untitled property',
      )
    })

    return [
      { label: 'All Properties', value: 'all' },
      ...Array.from(seen.entries()).map(([value, label]) => ({ value, label })),
    ]
  }, [inquiries])

  const filteredInquiries = useMemo(() => {
    const propertyFiltered =
      selectedProperty === 'all'
        ? inquiries
        : inquiries.filter(
            inquiry => inquiry.property?._id === selectedProperty,
          )

    return [...propertyFiltered].sort((first, second) => {
      const firstDate = new Date(first.createdAt || '').getTime()
      const secondDate = new Date(second.createdAt || '').getTime()

      return selectedSort === 'oldest'
        ? firstDate - secondDate
        : secondDate - firstDate
    })
  }, [inquiries, selectedProperty, selectedSort])

  const counts = useMemo(
    () => ({
      all: inquiries.length,
      new: inquiries.filter(inquiry => inquiry.status === 'new').length,
      replied: inquiries.filter(inquiry => inquiry.status === 'replied').length,
      closed: inquiries.filter(inquiry => inquiry.status === 'closed').length,
    }),
    [inquiries],
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

  const replyMutation = useMutation({
    mutationFn: async () => {
      if (!token || !activeInquiry?._id) {
        throw new Error('Missing inquiry information.')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/inquiries/${activeInquiry._id}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: replyMessage }),
        },
      )

      const result = await response.json()

      if (!response.ok || !result?.status) {
        throw new Error(result?.message || 'Failed to send reply')
      }

      return result
    },
    onSuccess: result => {
      toast.success(result?.message || 'Reply sent successfully.')
      setReplyDialogOpen(false)
      setReplyMessage('')
      setActiveInquiry(null)
      inquiriesQuery.refetch()
    },
    onError: error => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send reply.',
      )
    },
  })

  const statusMutation = useMutation({
    mutationFn: async ({
      inquiryId,
      nextStatus,
    }: {
      inquiryId: string
      nextStatus: InquiryStatus
    }) => {
      if (!token) {
        throw new Error('You need to sign in again to continue.')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/inquiries/${inquiryId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      )

      const result = await response.json()

      if (!response.ok || !result?.status) {
        throw new Error(result?.message || 'Failed to update inquiry status')
      }

      return result
    },
    onSuccess: result => {
      toast.success(result?.message || 'Inquiry status updated.')
      inquiriesQuery.refetch()
    },
    onError: error => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update inquiry status.',
      )
    },
  })

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
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32 rounded-[8px]" />
                <Skeleton className="h-10 w-24 rounded-[8px]" />
              </div>
              <div className="grid gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-24 w-full rounded-[12px]"
                  />
                ))}
              </div>
              <div className="grid gap-3 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-[0_4px_12px_rgba(16,24,40,0.08)] lg:grid-cols-[140px_minmax(0,1fr)_140px]">
                <Skeleton className="h-11 w-full rounded-[8px]" />
                <Skeleton className="h-11 w-full rounded-[8px]" />
                <Skeleton className="h-11 w-full rounded-[8px]" />
              </div>
              <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="h-40 w-full rounded-[12px]"
                    />
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
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#98a2b3]">
            Dashboard
          </p>
          <h1 className="mt-3 text-2xl font-bold text-[#111827]">
            Sign in to continue
          </h1>
          <p className="mt-2 text-sm text-[#667085]">
            You need an account to access your dashboard.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white"
            style={{
              background:
                'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
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
                  <Image
                    src="/logo.png"
                    alt="Alora"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-[24px] font-bold leading-none text-[#111827]">
                    Dashboard
                  </h1>
                  <p className="mt-2 text-sm font-medium text-[#475467]">
                    Welcome back, {displayName}
                  </p>
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
                <button
                  type="button"
                  onClick={() => setLogoutDialogOpen(true)}
                  className="inline-flex h-10 items-center justify-center rounded-[8px] px-4 text-sm font-medium text-white"
                  style={{
                    background:
                      'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
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
                const isActive = link.href === '/dashboard/inquiries'

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`inline-flex items-center gap-2 text-[15px] font-medium transition-colors ${
                      isActive
                        ? 'text-[#8BCCE6]'
                        : 'text-[#344054] hover:text-[#111827]'
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
                <h2 className="text-[22px] font-bold text-[#111827]">
                  Inquiries
                </h2>
                <p className="mt-2 text-sm text-[#667085]">
                  Manage incoming property inquiries for your{' '}
                  {dashboardRole === 'AGENT' ? 'clients' : 'listings'}.
                </p>
              </div>
              {/* <button
                type="button"
                onClick={() => toast.message('Templates are not connected yet.')}
                className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#475467]"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Templates
              </button> */}
            </section>

            <section className="grid gap-4 lg:grid-cols-4">
              {[
                {
                  label: 'All',
                  value: counts.all,
                  active: selectedStatus === 'all',
                  dot: '#79C5E7',
                  href: createNextUrl({ status: null, page: 1 }),
                },
                {
                  label: 'New',
                  value: counts.new,
                  active: selectedStatus === 'new',
                  dot: '#EAAA08',
                  href: createNextUrl({ status: 'new', page: 1 }),
                },
                {
                  label: 'Replied',
                  value: counts.replied,
                  active: selectedStatus === 'replied',
                  dot: '#22C55E',
                  href: createNextUrl({ status: 'replied', page: 1 }),
                },
                {
                  label: 'Closed',
                  value: counts.closed,
                  active: selectedStatus === 'closed',
                  dot: '#667085',
                  href: createNextUrl({ status: 'closed', page: 1 }),
                },
              ].map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`rounded-[12px] border px-4 py-4 shadow-[0_4px_12px_rgba(16,24,40,0.06)] transition-colors ${
                    item.active
                      ? 'border-[#8BCCE6] bg-[#EEF7FD]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#D0D5DD]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[30px] font-semibold text-[#111827]">
                      {item.value}
                    </p>
                    <span
                      className="inline-flex h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.dot }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-[#667085]">{item.label}</p>
                </Link>
              ))}
            </section>

            <section className="grid gap-3 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-[0_4px_12px_rgba(16,24,40,0.08)] lg:grid-cols-[140px_minmax(0,1fr)_140px]">
              <button
                type="button"
                onClick={() =>
                  toast.message('Additional filters are not available yet.')
                }
                className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#475467]"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </button>

              <SearchableSelect
                value={selectedProperty}
                onChange={value =>
                  router.push(createNextUrl({ property: value, page: 1 }))
                }
                options={propertyOptions}
                placeholder="All Properties"
                searchPlaceholder="Search properties..."
              />

              <SearchableSelect
                value={selectedSort}
                onChange={value =>
                  router.push(createNextUrl({ sort: value, page: 1 }))
                }
                options={sortOptions}
                placeholder="Newest"
                searchPlaceholder="Search order..."
              />
            </section>

            <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
              {inquiriesQuery.isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="h-40 w-full rounded-[12px]"
                    />
                  ))}
                </div>
              ) : inquiriesQuery.isError ? (
                <div className="flex flex-col items-center justify-center rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-12 text-center">
                  <Mail className="h-10 w-10 text-[#E53935]" />
                  <h4 className="mt-4 text-xl font-bold text-[#111827]">
                    Couldn&apos;t load inquiries
                  </h4>
                  <p className="mt-2 max-w-md text-sm text-[#667085]">
                    {inquiriesQuery.error instanceof Error
                      ? inquiriesQuery.error.message
                      : 'Something went wrong while loading your inquiries.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => inquiriesQuery.refetch()}
                    className="mt-5 inline-flex h-10 items-center justify-center rounded-[8px] border border-[#D9DBE3] px-4 text-sm font-medium text-[#475467] transition-colors hover:bg-[#F9FAFB]"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try again
                  </button>
                </div>
              ) : filteredInquiries.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-[#FBFCFD] px-6 py-14 text-center">
                  <Mail className="h-12 w-12 text-[#C7CCD4]" />
                  <h4 className="mt-4 text-[28px] font-bold leading-tight text-[#334155]">
                    No inquiries found
                  </h4>
                  <p className="mt-3 max-w-md text-base text-[#667085]">
                    No inquiries yet
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {filteredInquiries.map(inquiry => (
                      <article
                        key={inquiry._id}
                        className="rounded-[12px] border border-[#EAECEF] bg-[#FCFDFE] p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-semibold text-[#111827]">
                                {inquiry.property?.basicInformation
                                  ?.propertyTitle || 'Untitled property'}
                              </h3>
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                                  statusBadgeClassName[inquiry.status || 'new']
                                }`}
                              >
                                {inquiry.status || 'new'}
                              </span>
                            </div>

                            <div className="mt-3 grid gap-2 text-sm text-[#667085] md:grid-cols-2">
                              <p>
                                <span className="font-medium text-[#344054]">
                                  From:
                                </span>{' '}
                                {inquiry.fullName || 'Unknown'}
                              </p>
                              <p>
                                <span className="font-medium text-[#344054]">
                                  Email:
                                </span>{' '}
                                {inquiry.email || 'N/A'}
                              </p>
                              <p>
                                <span className="font-medium text-[#344054]">
                                  Phone:
                                </span>{' '}
                                {inquiry.phone || 'N/A'}
                              </p>
                              <p>
                                <span className="font-medium text-[#344054]">
                                  Received:
                                </span>{' '}
                                {formatDate(inquiry.createdAt)}
                              </p>
                            </div>

                            <div className="mt-4 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3">
                              <p className="text-sm leading-6 text-[#344054]">
                                {inquiry.message || 'No message provided.'}
                              </p>
                            </div>

                            {inquiry.replies?.length ? (
                              <div className="mt-4 rounded-[10px] border border-[#D6F5E2] bg-[#F1FCF5] px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#067647]">
                                  Latest Reply
                                </p>
                                <p className="mt-2 text-sm leading-6 text-[#344054]">
                                  {inquiry.replies[inquiry.replies.length - 1]
                                    ?.message || 'Reply sent'}
                                </p>
                              </div>
                            ) : null}
                          </div>

                          <div className="flex w-full flex-col gap-3 lg:w-[230px]">
                            <SearchableSelect
                              value={inquiry.status || 'new'}
                              onChange={value =>
                                statusMutation.mutate({
                                  inquiryId: inquiry._id,
                                  nextStatus: value as InquiryStatus,
                                })
                              }
                              options={[
                                { label: 'New', value: 'new' },
                                { label: 'Replied', value: 'replied' },
                                { label: 'Closed', value: 'closed' },
                              ]}
                              placeholder="Update status"
                              searchPlaceholder="Search status..."
                            />

                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              className="h-11 rounded-[8px] border-[#D9DBE3] bg-white px-4 text-sm text-[#475467]"
                              onClick={() => {
                                setActiveInquiry(inquiry)
                                setReplyMessage('')
                                setReplyDialogOpen(true)
                              }}
                            >
                              Reply
                            </Button>

                            <Link
                              href={
                                inquiry.property?._id
                                  ? `/rentals/${inquiry.property._id}`
                                  : '#'
                              }
                              className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#D9DBE3] bg-white px-4 text-sm font-medium text-[#475467]"
                            >
                              View Property
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {paginationInfo && paginationInfo.totalPages > 1 ? (
                    <div className="mt-6 flex flex-col gap-3 border-t border-[#EEF2F6] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-[#667085]">
                        Page {paginationInfo.currentPage} of{' '}
                        {paginationInfo.totalPages}
                      </p>
                      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href={createNextUrl({ page: page - 1 })}
                              className={
                                !paginationInfo.hasPrevPage
                                  ? 'pointer-events-none opacity-50'
                                  : ''
                              }
                            />
                          </PaginationItem>
                          {renderPaginationNumbers(
                            paginationInfo.currentPage,
                            paginationInfo.totalPages,
                          ).map(pageNumber => (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                href={createNextUrl({ page: pageNumber })}
                                isActive={
                                  pageNumber === paginationInfo.currentPage
                                }
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              href={createNextUrl({ page: page + 1 })}
                              className={
                                !paginationInfo.hasNextPage
                                  ? 'pointer-events-none opacity-50'
                                  : ''
                              }
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

      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent
          className="max-w-[560px] rounded-[12px] border border-[#E5E7EB] bg-white p-0"
          showCloseButton={false}
        >
          <div className="p-5">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#111827]">
                Reply to inquiry
              </DialogTitle>
              <DialogDescription className="text-sm text-[#4B5563]">
                Send a direct reply to {activeInquiry?.fullName || 'this lead'}{' '}
                about{' '}
                {activeInquiry?.property?.basicInformation?.propertyTitle ||
                  'the property'}
                .
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-semibold text-[#374151]">
                Message
              </label>
              <Textarea
                value={replyMessage}
                onChange={event => setReplyMessage(event.target.value)}
                placeholder="Thank you for your interest..."
                className="min-h-[140px] rounded-[8px] border border-[#E5E7EB]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#F1F5F9] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-start">
            <button
              type="button"
              onClick={() => {
                setReplyDialogOpen(false)
                setReplyMessage('')
                setActiveInquiry(null)
              }}
              className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#D9DBE3] px-4 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => replyMutation.mutate()}
              disabled={!replyMessage.trim() || replyMutation.isPending}
              className="inline-flex h-10 items-center justify-center rounded-[8px] px-4 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background:
                  'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
              }}
            >
              {replyMutation.isPending ? 'Sending Reply...' : 'Send Reply'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
      />
    </main>
  )
}

export default function DashboardInquiriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f5f7]" />}>
      <DashboardInquiriesPageContent />
    </Suspense>
  )
}
