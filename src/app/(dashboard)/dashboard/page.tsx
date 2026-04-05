'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  Home,
  Lock,
  Settings,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'

import { LogoutConfirmDialog } from '@/components/shared/LogoutConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

type DashboardRole = 'LANDLORD' | 'AGENT'

type DashboardStat = {
  label: string
  value: string
  helper?: string
  icon: typeof Home
  iconClassName: string
}

type QuickAction = {
  title: string
  description: string
  icon: typeof Home
  iconClassName: string
}

type AppointmentDay = {
  day: string
  date: string
  label: string
  appointments: string
  isToday?: boolean
  isActive?: boolean
}

type OwnerDashboardStats = {
  totalProperties: number
  activeListings: number
  totalViews: number
  pendingAppointments: number
  weeklyAppointments: Array<{
    date: string
    count: number
  }>
}

type OwnerDashboardStatsResponse = {
  status: boolean
  message: string
  data: OwnerDashboardStats
}

const dashboardContent: Record<
  DashboardRole,
  {
    stats: DashboardStat[]
    quickActions: QuickAction[]
    analyticsText: string
    activities: string[]
  }
> = {
  LANDLORD: {
    stats: [
      {
        label: 'Total Properties',
        value: '0',
        icon: Home,
        iconClassName: 'text-[#8BCCE6]',
      },
      {
        label: 'Active Listing',
        value: '0',
        icon: CheckCircle2,
        iconClassName: 'text-[#66D59A]',
      },
      {
        label: 'Total Views',
        value: '---',
        helper: 'Upgrade to Unlock',
        icon: Eye,
        iconClassName: 'text-[#98A2B3]',
      },
      {
        label: 'Pending Appointment',
        value: '0',
        icon: CalendarDays,
        iconClassName: 'text-[#F2B94B]',
      },
    ],
    quickActions: [
      {
        title: 'Add Rental Property',
        description: 'List a new rental',
        icon: Home,
        iconClassName: 'bg-[#EAF7FD] text-[#79C5E7]',
      },
      {
        title: 'Add Sale Property',
        description: 'List a property for sale',
        icon: BriefcaseBusiness,
        iconClassName: 'bg-[#FFF1E8] text-[#F6855C]',
      },
      {
        title: 'View all Properties',
        description: 'Manage your listings',
        icon: Eye,
        iconClassName:
          'bg-[linear-gradient(135deg,#8BCCE6,#F6855C)] text-white',
      },
    ],
    analyticsText: 'More reporting and deeper insights.',
    activities: [
      'No recent activity',
      'New inquiries and approvals will appear here once listings go live.',
    ],
  },
  AGENT: {
    stats: [
      {
        label: 'Managed Properties',
        value: '0',
        icon: Home,
        iconClassName: 'text-[#8BCCE6]',
      },
      {
        label: 'Active Deals',
        value: '0',
        icon: CheckCircle2,
        iconClassName: 'text-[#66D59A]',
      },
      {
        label: 'Client Views',
        value: '---',
        helper: 'Upgrade to Unlock',
        icon: Eye,
        iconClassName: 'text-[#98A2B3]',
      },
      {
        label: 'Pending Appointment',
        value: '0',
        icon: CalendarDays,
        iconClassName: 'text-[#F2B94B]',
      },
    ],
    quickActions: [
      {
        title: 'Add Client Listing',
        description: 'Publish a managed property',
        icon: Home,
        iconClassName: 'bg-[#EAF7FD] text-[#79C5E7]',
      },
      {
        title: 'Schedule Showing',
        description: 'Create a client appointment',
        icon: CalendarDays,
        iconClassName: 'bg-[#FFF1E8] text-[#F6855C]',
      },
      {
        title: 'View Pipeline',
        description: 'Follow open opportunities',
        icon: BriefcaseBusiness,
        iconClassName:
          'bg-[linear-gradient(135deg,#8BCCE6,#F6855C)] text-white',
      },
    ],
    analyticsText: 'Pipeline reporting and client engagement metrics.',
    activities: [
      'No recent activity',
      'Client interactions and report updates will appear here.',
    ],
  },
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

const formatDashboardDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`)

  return {
    day: new Intl.DateTimeFormat('en-US', { weekday: 'short' })
      .format(date)
      .toUpperCase(),
    dateNumber: new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(
      date,
    ),
    label: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date),
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') {
      return
    }

    if (session.user?.role === 'USER') {
      router.replace('/account')
    }
  }, [router, session, status])

  const dashboardRole = useMemo(() => {
    const role = session?.user?.role
    return role === 'AGENT' ? 'AGENT' : 'LANDLORD'
  }, [session?.user?.role]) as DashboardRole

  const content = dashboardContent[dashboardRole]
  const token = session?.user?.accessToken

  const statsQuery = useQuery<OwnerDashboardStatsResponse>({
    queryKey: ['owner-dashboard', token],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/owner-dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        },
      )

      const result: OwnerDashboardStatsResponse = await response.json()

      if (!response.ok || !result.status) {
        throw new Error(result.message || 'Failed to load dashboard stats')
      }

      return result
    },
    enabled: Boolean(token) && status === 'authenticated',
  })

  const stats = statsQuery.data?.data

  const statCards: DashboardStat[] = useMemo(
    () => [
      {
        label:
          dashboardRole === 'AGENT' ? 'Managed Properties' : 'Total Properties',
        value: String(stats?.totalProperties ?? 0),
        icon: Home,
        iconClassName: 'text-[#8BCCE6]',
      },
      {
        label: dashboardRole === 'AGENT' ? 'Active Deals' : 'Active Listing',
        value: String(stats?.activeListings ?? 0),
        icon: CheckCircle2,
        iconClassName: 'text-[#22C55E]',
      },
      {
        label: dashboardRole === 'AGENT' ? 'Client Views' : 'Total Views',
        value: String(stats?.totalViews ?? 0),
        icon: Eye,
        iconClassName: 'text-[#667085]',
      },
      {
        label: 'Pending Appointment',
        value: String(stats?.pendingAppointments ?? 0),
        icon: CalendarDays,
        iconClassName: 'text-[#EAAA08]',
      },
    ],
    [dashboardRole, stats],
  )

  const appointmentDays: AppointmentDay[] = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10)

    return (stats?.weeklyAppointments || []).map((item, index) => {
      const formatted = formatDashboardDate(item.date)

      return {
        day: formatted.day,
        date: formatted.dateNumber,
        label: formatted.label,
        appointments:
          item.count === 1 ? '1 appointment' : `${item.count} appointments`,
        isToday: item.date === todayKey,
        isActive: index === 0,
      }
    })
  }, [stats?.weeklyAppointments])
  const isOverviewLoading = statsQuery.isLoading && !stats

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
              <section>
                <Skeleton className="mb-5 h-8 w-28 rounded-[8px]" />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <article
                      key={index}
                      className="rounded-[12px] border border-[#e5e7eb] bg-white px-5 py-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-full space-y-3">
                          <Skeleton className="h-4 w-28 rounded-[8px]" />
                          <Skeleton className="h-8 w-16 rounded-[8px]" />
                          <Skeleton className="h-3 w-24 rounded-[8px]" />
                        </div>
                        <Skeleton className="h-9 w-9 rounded-full" />
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section>
                <Skeleton className="mb-5 h-7 w-32 rounded-[8px]" />
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[12px] border border-[#e5e7eb] bg-white px-5 py-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]"
                    >
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="w-full space-y-2">
                          <Skeleton className="h-4 w-36 rounded-[8px]" />
                          <Skeleton className="h-3 w-28 rounded-[8px]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[12px] border border-[#e5e7eb] bg-white px-5 py-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-36 rounded-[8px]" />
                    <Skeleton className="h-4 w-48 rounded-[8px]" />
                  </div>
                  <Skeleton className="h-9 w-24 rounded-[8px]" />
                </div>
              </section>

              <section className="rounded-[12px] border border-[#e5e7eb] bg-white px-5 py-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40 rounded-[8px]" />
                    <Skeleton className="h-4 w-32 rounded-[8px]" />
                  </div>
                  <Skeleton className="h-9 w-20 rounded-[8px]" />
                </div>

                <div className="mt-5 space-y-3">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[72px_1fr] items-center rounded-[12px] border border-[#edf1f5] bg-[#fbfcfd] px-3 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-8 rounded-[8px]" />
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-16 rounded-[8px]" />
                          <Skeleton className="h-3 w-24 rounded-[8px]" />
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Skeleton className="h-3 w-24 rounded-[8px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
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

  const displayName =
    session.user?.name || session.user?.email || 'Welcome back'

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

  return (
    <main className="min-h-screen ">
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
                <Link
                  href="/"
                  className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#d8e4ec] bg-white px-4 text-sm font-medium text-[#475467] transition-colors hover:bg-[#f8fafc]"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Website Home
                </Link>
                <Button
                  type="button"
                  onClick={() => setLogoutDialogOpen(true)}
                  className="h-10 rounded-[8px] px-4 text-sm font-medium text-white"
                  style={{
                    background:
                      'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>

          <div className="border-y border-[#eef2f6] bg-white px-5 py-4 md:px-8 xl:px-16">
            <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {dashboardNavLinks.map(link => {
                const Icon = link.icon
                const isActive = link.href === '/dashboard'

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
            <section>
              <h2 className="mb-5 text-[22px] font-bold text-[#111827]">
                Overview
              </h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {isOverviewLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <article
                        key={index}
                        className="rounded-[12px] border border-[#e5e7eb] bg-white px-5 py-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="w-full space-y-3">
                            <Skeleton className="h-4 w-28 rounded-[8px]" />
                            <Skeleton className="h-8 w-16 rounded-[8px]" />
                            <Skeleton className="h-3 w-24 rounded-[8px]" />
                          </div>
                          <Skeleton className="h-9 w-9 rounded-full" />
                        </div>
                      </article>
                    ))
                  : statCards.map(stat => {
                      const Icon = stat.icon

                      return (
                        <article
                          key={stat.label}
                          className="rounded-[12px] border border-[#e5e7eb] bg-white px-5 py-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-[#667085]">
                                {stat.label}
                              </p>
                              <p className="mt-3 text-[32px] font-bold leading-none text-[#111827]">
                                {stat.value}
                              </p>
                              {stat.helper ? (
                                <p className="mt-2 text-[11px] font-medium text-[#98a2b3]">
                                  {stat.helper}
                                </p>
                              ) : null}
                            </div>
                            <div className="rounded-full border border-[#eef2f6] p-2">
                              <Icon
                                className={`h-4 w-4 ${stat.iconClassName}`}
                              />
                            </div>
                          </div>
                        </article>
                      )
                    })}
              </div>
            </section>

            <section>
              <h2 className="mb-5 text-[18px] font-bold text-[#111827]">
                Quick Action
              </h2>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                {content.quickActions.map(action => {
                  const Icon = action.icon

                  return (
                    <button
                      key={action.title}
                      type="button"
                      className="flex items-center gap-4 rounded-[12px] border border-[#e5e7eb] bg-white px-5 py-5 text-left shadow-[0_4px_12px_rgba(16,24,40,0.08)] transition-transform hover:-translate-y-0.5"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${action.iconClassName}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">
                          {action.title}
                        </p>
                        <p className="text-xs text-[#667085]">
                          {action.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="rounded-[12px] border border-[#e5e7eb] bg-white px-5 py-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">
                    Advanced analytics
                  </h2>
                  <p className="mt-1 text-xs text-[#667085]">
                    {content.analyticsText}
                  </p>
                </div>
                <Button
                  type="button"
                  className="h-9 rounded-xl bg-[#111111] px-4 text-xs font-semibold text-white hover:bg-[#222222]"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Upgrade
                </Button>
              </div>
            </section>

            <section className="rounded-[12px] border border-[#e5e7eb] bg-white px-5 py-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">
                    Weekly Appointments
                  </h2>
                  <p className="mt-1 text-xs text-[#667085]">
                    Next 7 days overview
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/appointments"
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-[#d8e4ec] bg-white px-4 text-xs font-semibold text-[#5d7285] transition-colors hover:bg-[#f8fafc]"
                  >
                    View all
                  </Link>
                </div>
              </div>

              {statsQuery.isError ? (
                <div className="mt-4 rounded-[12px] border border-[#f1d6d2] bg-[#fff6f5] px-4 py-3 text-sm text-[#b42318]">
                  {statsQuery.error instanceof Error
                    ? statsQuery.error.message
                    : 'Could not load weekly appointments'}
                </div>
              ) : isOverviewLoading ? (
                <div className="mt-5 space-y-3">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[72px_1fr] items-center rounded-[12px] border border-[#edf1f5] bg-[#fbfcfd] px-3 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-8 rounded-[8px]" />
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-16 rounded-[8px]" />
                          <Skeleton className="h-3 w-24 rounded-[8px]" />
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Skeleton className="h-3 w-24 rounded-[8px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {appointmentDays.map((day, index) => (
                    <div
                      key={`${day.label}-${index}`}
                      className={`grid grid-cols-[72px_1fr] items-center rounded-[12px] border px-3 py-3 ${
                        day.isActive
                          ? 'border-[#bfe6f5] bg-[#eef8ff]'
                          : 'border-[#edf1f5] bg-[#fbfcfd]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-[22px] rounded-md bg-[#89d3ef] px-1 py-1 text-center text-[9px] font-bold text-white">
                          <div>{day.day}</div>
                          <div>{day.date}</div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#111827]">
                            {day.label}{' '}
                            {day.isToday ? (
                              <span className="text-[#8BCCE6]">Today</span>
                            ) : null}
                          </p>
                          <p className="text-[11px] text-[#667085]">
                            {day.appointments}
                          </p>
                        </div>
                      </div>
                      <p className="text-center text-[12px] text-[#667085]">
                        {day.appointments}
                      </p>
                    </div>
                  ))}
                  {!statsQuery.isLoading && appointmentDays.length === 0 ? (
                    <div className="rounded-[12px] border border-[#edf1f5] bg-[#fbfcfd] px-4 py-4 text-sm text-[#667085]">
                      No appointments found for the next 7 days.
                    </div>
                  ) : null}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-sm font-bold text-[#111827]">
                Recent Activity
              </h2>
              <div className="rounded-[12px] border border-[#e5e7eb] bg-white px-5 py-6 text-center shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
                <p className="text-sm font-semibold text-[#111827]">
                  {content.activities[0]}
                </p>
                <p className="mt-2 text-sm text-[#667085]">
                  {content.activities[1]}
                </p>
              </div>
            </section>
          </div>
        </section>
      </div>

      <Dialog
        open={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
      >
        <DialogContent className="max-w-[480px] rounded-[24px] border border-[#e6e8ec] bg-white p-0">
          <div className="px-6 pb-6 pt-5">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#111827]">
                Add Appointment
              </DialogTitle>
            </DialogHeader>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                Property*
                <select className="h-11 rounded-xl border border-[#d0d5dd] px-3 text-sm text-[#667085] outline-none">
                  <option>Select a property</option>
                </select>
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                  Date*
                  <input
                    type="text"
                    placeholder="mm/dd/yyyy"
                    className="h-11 rounded-xl border border-[#d0d5dd] px-3 text-sm text-[#667085] outline-none"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                  Time*
                  <select className="h-11 rounded-xl border border-[#d0d5dd] px-3 text-sm text-[#667085] outline-none">
                    <option>Select a time</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                Your Name*
                <input
                  type="text"
                  placeholder="John Doe"
                  className="h-11 rounded-xl border border-[#d0d5dd] px-3 text-sm text-[#667085] outline-none"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                Email*
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="h-11 rounded-xl border border-[#d0d5dd] px-3 text-sm text-[#667085] outline-none"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                Phone*
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onInput={event => {
                    event.currentTarget.value =
                      event.currentTarget.value.replace(/\D/g, '')
                  }}
                  placeholder="5551234567"
                  className="h-11 rounded-xl border border-[#d0d5dd] px-3 text-sm text-[#667085] outline-none"
                />
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-[#344054]">
                Notes (Optional)
                <textarea
                  placeholder="Any special requests or questions..."
                  className="min-h-[92px] rounded-xl border border-[#d0d5dd] px-3 py-3 text-sm text-[#667085] outline-none"
                />
              </label>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-[#d0d5dd] bg-white text-[#475467]"
                onClick={() => setAppointmentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-11 rounded-xl text-white"
                style={{
                  background:
                    'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
                }}
              >
                Add Appointment
              </Button>
            </div>
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
