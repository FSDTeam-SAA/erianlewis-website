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
  ChevronDown,
  ClipboardList,
  Home,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { LogoutConfirmDialog } from '@/components/shared/LogoutConfirmDialog'
import { SearchableSelect } from '@/components/shared/SearchableSelect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
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

type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
type DayKey =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'

type TimeSlot = {
  start: string
  end: string
}

type AvailabilityResponse = {
  status: boolean
  message: string
  data: {
    _id?: string
    schedule?: Partial<Record<DayKey, TimeSlot[]>>
  }
}

type BlockedDateItem = {
  _id: string
  date: string
  reason?: string
}

type BlockedDatesResponse = {
  status: boolean
  message: string
  data: BlockedDateItem[]
}

type AppointmentItem = {
  _id: string
  property?: {
    _id?: string
    basicInformation?: {
      propertyTitle?: string
    }
    address?: {
      island?: { name?: string } | string | null
    }
  }
  customerName?: string
  email?: string
  phone?: string
  date?: string
  time?: string
  notes?: string
  status?: AppointmentStatus
}

type AppointmentsResponse = {
  status: boolean
  message: string
  data: {
    appointments: AppointmentItem[]
    paginationInfo: {
      currentPage: number
      totalPages: number
      totalData: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
}

type RentalPropertyItem = {
  _id: string
  basicInformation?: {
    propertyTitle?: string
  }
}

type RentalsResponse = {
  status: boolean
  message: string
  data: {
    properties: RentalPropertyItem[]
  }
}

type AvailableSlotsResponse = {
  status: boolean
  message: string
  data: {
    available?: boolean
    reason?: string
    slots?: TimeSlot[]
    bookedTimes?: string[]
  }
}

const dashboardNavLinks = [
  { label: 'Overview', href: '/dashboard', icon: BarChart3 },
  { label: 'Rentals', href: '/dashboard/rentals', icon: Home },
  { label: 'Sales', href: '/dashboard/sales', icon: BriefcaseBusiness },
  { label: 'Appointments', href: '/dashboard/appointments', icon: CalendarDays },
  { label: 'Inquiries', href: '/dashboard/inquiries', icon: ClipboardList },
  { label: 'Profile', href: '/dashboard/profile', icon: UserRound },
]

const dayOrder: Array<{ key: DayKey; label: string }> = [
  { key: 'sunday', label: 'Sunday' },
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
]

const defaultSchedule = (): Record<DayKey, TimeSlot[]> => ({
  sunday: [],
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
})

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
]

const statusBadgeClassName: Record<AppointmentStatus, string> = {
  pending: 'border-[#FDE68A] bg-[#FFF9E6] text-[#B54708]',
  confirmed: 'border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]',
  completed: 'border-[#D0D5DD] bg-[#F8FAFC] text-[#475467]',
  cancelled: 'border-[#FECACA] bg-[#FEF2F2] text-[#B42318]',
}

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

const formatDate = (value?: string) => {
  if (!value) return 'N/A'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

const getTodayDateValue = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${date}`
}

const isPastDateValue = (value?: string) => {
  if (!value) return false

  return value < getTodayDateValue()
}

const timeToMinutes = (value?: string) => {
  if (!value) return -1

  const normalizedValue = value.trim().toUpperCase()
  const match = normalizedValue.match(/^(\d{1,2}):(\d{2})(?:\s?(AM|PM))?$/)

  if (!match) {
    return -1
  }

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const meridiem = match[3]

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return -1
  }

  if (meridiem) {
    if (meridiem === 'AM' && hours === 12) {
      hours = 0
    } else if (meridiem === 'PM' && hours !== 12) {
      hours += 12
    }
  }

  return hours * 60 + minutes
}

const normalizeTimeValue = (value?: string) => value?.trim() || ''

const renderPaginationNumbers = (currentPage: number, totalPages: number) => {
  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1])

  return Array.from(pages)
    .filter(page => page >= 1 && page <= totalPages)
    .sort((first, second) => first - second)
}

function DashboardAppointmentsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const token = session?.user?.accessToken

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [availabilityOpen, setAvailabilityOpen] = useState(true)
  const [schedule, setSchedule] = useState<Record<DayKey, TimeSlot[]>>(defaultSchedule)
  const [blockDateValue, setBlockDateValue] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    propertyId: '',
    date: '',
    time: '',
    customerName: '',
    email: '',
    phone: '',
    notes: '',
  })

  useEffect(() => {
    if (status !== 'authenticated') return

    if (session.user?.role === 'USER') {
      router.replace('/account')
    }
  }, [router, session, status])

  const displayName = session?.user?.name || session?.user?.email || 'Welcome back'
  const page = Number(searchParams.get('page') || '1') || 1
  const limit = 10
  const selectedStatus = searchParams.get('status') || 'all'
  const selectedProperty = searchParams.get('property') || 'all'
  const selectedSort = searchParams.get('sort') || 'newest'

  const createNextUrl = (updates: Record<string, string | number | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all') {
        params.delete(key)
        return
      }

      params.set(key, String(value))
    })

    return `/dashboard/appointments?${params.toString()}`
  }

  const availabilityQuery = useQuery({
    queryKey: ['dashboard-availability', token],
    queryFn: () => fetchJson<AvailabilityResponse>('/appointments/availability', token),
    enabled: Boolean(token) && status === 'authenticated',
  })

  const blockedDatesQuery = useQuery({
    queryKey: ['dashboard-blocked-dates', token],
    queryFn: () => fetchJson<BlockedDatesResponse>('/appointments/blocked-dates', token),
    enabled: Boolean(token) && status === 'authenticated',
  })

  const appointmentsQuery = useQuery({
    queryKey: ['dashboard-appointments', token, page, selectedStatus],
    queryFn: () =>
      fetchJson<AppointmentsResponse>(
        `/appointments/my?page=${page}&limit=${limit}${
          selectedStatus !== 'all' ? `&status=${selectedStatus}` : ''
        }`,
        token,
      ),
    enabled: Boolean(token) && status === 'authenticated',
  })

  const propertiesQuery = useQuery({
    queryKey: ['dashboard-property-options', token],
    queryFn: () =>
      fetchJson<RentalsResponse>(
        '/rental-properties?page=1&limit=100',
        token,
      ),
    enabled: Boolean(token) && status === 'authenticated',
  })

  const availableSlotsQuery = useQuery({
    queryKey: [
      'dashboard-available-slots',
      newAppointment.propertyId,
      newAppointment.date,
    ],
    queryFn: () =>
      fetchJson<AvailableSlotsResponse>(
        `/appointments/available-slots?propertyId=${encodeURIComponent(
          newAppointment.propertyId,
        )}&date=${encodeURIComponent(newAppointment.date)}`,
      ),
    enabled: Boolean(newAppointment.propertyId && newAppointment.date),
  })

  useEffect(() => {
    const next = defaultSchedule()
    const responseSchedule = availabilityQuery.data?.data.schedule || {}

    dayOrder.forEach(day => {
      next[day.key] = responseSchedule[day.key] || []
    })

    setSchedule(next)
  }, [availabilityQuery.data?.data.schedule])

  const appointments = useMemo(
    () => appointmentsQuery.data?.data.appointments || [],
    [appointmentsQuery.data?.data.appointments],
  )

  const propertyOptions = useMemo(
    () => [
      { label: 'All Properties', value: 'all' },
      ...((propertiesQuery.data?.data.properties || []).map(property => ({
        label: property.basicInformation?.propertyTitle || 'Untitled property',
        value: property._id,
      }))),
    ],
    [propertiesQuery.data?.data.properties],
  )

  const filteredAppointments = useMemo(() => {
    const propertyFiltered =
      selectedProperty === 'all'
        ? appointments
        : appointments.filter(appointment => appointment.property?._id === selectedProperty)

    return [...propertyFiltered].sort((first, second) => {
      const firstDate = new Date(first.date || '').getTime()
      const secondDate = new Date(second.date || '').getTime()

      return selectedSort === 'oldest' ? firstDate - secondDate : secondDate - firstDate
    })
  }, [appointments, selectedProperty, selectedSort])

  const counts = useMemo(
    () => ({
      all: appointments.length,
      pending: appointments.filter(item => item.status === 'pending').length,
      confirmed: appointments.filter(item => item.status === 'confirmed').length,
      completed: appointments.filter(item => item.status === 'completed').length,
      cancelled: appointments.filter(item => item.status === 'cancelled').length,
    }),
    [appointments],
  )

  const availableSlots = useMemo(() => {
    const slots = availableSlotsQuery.data?.data.slots || []

    if (newAppointment.date !== getTodayDateValue()) {
      return slots
    }

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    return slots.filter(slot => timeToMinutes(slot.start) >= currentMinutes)
  }, [availableSlotsQuery.data?.data.slots, newAppointment.date])

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

  const saveAvailabilityMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('You need to sign in again to continue.')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/availability`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ schedule }),
        },
      )

      const result = await response.json()

      if (!response.ok || !result?.status) {
        throw new Error(result?.message || 'Failed to save schedule')
      }

      return result
    },
    onSuccess: result => {
      toast.success(result?.message || 'Availability saved.')
      availabilityQuery.refetch()
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : 'Failed to save schedule.')
    },
  })

  const blockDateMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('You need to sign in again to continue.')
      if (!blockDateValue) throw new Error('Date is required')
      if (isPastDateValue(blockDateValue)) {
        throw new Error('You cannot block a past date')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/blocked-dates`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: blockDateValue,
            reason: blockReason,
          }),
        },
      )

      const result = await response.json()

      if (!response.ok || !result?.status) {
        throw new Error(result?.message || 'Failed to block date')
      }

      return result
    },
    onSuccess: result => {
      toast.success(result?.message || 'Date blocked successfully.')
      setBlockDateValue('')
      setBlockReason('')
      blockedDatesQuery.refetch()
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : 'Failed to block date.')
    },
  })

  const deleteBlockedDateMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error('You need to sign in again to continue.')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/blocked-dates/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const result = await response.json()

      if (!response.ok || !result?.status) {
        throw new Error(result?.message || 'Failed to remove blocked date')
      }

      return result
    },
    onSuccess: result => {
      toast.success(result?.message || 'Blocked date removed.')
      blockedDatesQuery.refetch()
    },
    onError: error => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to remove blocked date.',
      )
    },
  })

  const createAppointmentMutation = useMutation({
    mutationFn: async () => {
      const selectedTime = normalizeTimeValue(newAppointment.time)
      const matchedSlot = availableSlots.find(
        slot => normalizeTimeValue(slot.start) === selectedTime,
      )

      if (!matchedSlot) {
        throw new Error('Please select a valid available time slot.')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAppointment,
          time: normalizeTimeValue(matchedSlot.start),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result?.status) {
        throw new Error(result?.message || 'Failed to create appointment')
      }

      return result
    },
    onSuccess: result => {
      toast.success(result?.message || 'Appointment created successfully.')
      setAppointmentDialogOpen(false)
      setNewAppointment({
        propertyId: '',
        date: '',
        time: '',
        customerName: '',
        email: '',
        phone: '',
        notes: '',
      })
      appointmentsQuery.refetch()
    },
    onError: error => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create appointment.',
      )
    },
  })

  const appointmentStatusMutation = useMutation({
    mutationFn: async ({
      appointmentId,
      nextStatus,
    }: {
      appointmentId: string
      nextStatus: AppointmentStatus
    }) => {
      if (!token) throw new Error('You need to sign in again to continue.')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/${appointmentId}/status`,
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
        throw new Error(result?.message || 'Failed to update appointment status')
      }

      return result
    },
    onSuccess: result => {
      toast.success(result?.message || 'Appointment status updated.')
      appointmentsQuery.refetch()
    },
    onError: error => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update appointment status.',
      )
    },
  })

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!token) throw new Error('You need to sign in again to continue.')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/${appointmentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const result = await response.json()

      if (!response.ok || !result?.status) {
        throw new Error(result?.message || 'Failed to delete appointment')
      }

      return result
    },
    onSuccess: result => {
      toast.success(result?.message || 'Appointment deleted.')
      appointmentsQuery.refetch()
    },
    onError: error => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete appointment.',
      )
    },
  })

  const pageLoading =
    status === 'loading' ||
    (status === 'authenticated' &&
      (availabilityQuery.isLoading ||
        blockedDatesQuery.isLoading ||
        appointmentsQuery.isLoading))

  if (pageLoading) {
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
              <Skeleton className="h-16 w-full rounded-[12px]" />
              <Skeleton className="h-40 w-full rounded-[12px]" />
              <div className="grid gap-4 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 w-full rounded-[12px]" />
                ))}
              </div>
              <div className="grid gap-3 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-[0_4px_12px_rgba(16,24,40,0.08)] lg:grid-cols-[140px_minmax(0,1fr)_140px_180px]">
                <Skeleton className="h-11 w-full rounded-[8px]" />
                <Skeleton className="h-11 w-full rounded-[8px]" />
                <Skeleton className="h-11 w-full rounded-[8px]" />
                <Skeleton className="h-11 w-full rounded-[8px]" />
              </div>
              <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-40 w-full rounded-[12px]" />
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
          <h1 className="mt-3 text-2xl font-bold text-[#111827]">Sign in to continue</h1>
          <p className="mt-2 text-sm text-[#667085]">
            You need an account to access your dashboard.
          </p>
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

  const blockedDates = blockedDatesQuery.data?.data || []
  const paginationInfo = appointmentsQuery.data?.data.paginationInfo

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
                const isActive = link.href === '/dashboard/appointments'

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
            <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
              <button
                type="button"
                onClick={() => setAvailabilityOpen(current => !current)}
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <div>
                  <h2 className="text-[22px] font-bold text-[#111827]">Weekly Availability</h2>
                  <p className="mt-1 text-sm text-[#667085]">
                    Set the time windows when appointment bookings are allowed.
                  </p>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-[#667085] transition-transform ${
                    availabilityOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {availabilityOpen ? (
                <>
                  <div className="mb-4 mt-4 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => saveAvailabilityMutation.mutate()}
                      disabled={saveAvailabilityMutation.isPending}
                      className="h-10 rounded-[8px] px-4 text-sm font-semibold text-white"
                      style={{
                        background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
                      }}
                    >
                      {saveAvailabilityMutation.isPending ? 'Saving...' : 'Save Schedule'}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {dayOrder.map(day => (
                      <div
                        key={day.key}
                        className="rounded-[10px] border border-[#EEF2F6] bg-[#FCFDFE] px-4 py-4"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <h3 className="font-semibold text-[#111827]">{day.label}</h3>
                            <p className="mt-1 text-sm text-[#98A2B3]">
                              {schedule[day.key].length
                                ? `${schedule[day.key].length} slot${schedule[day.key].length > 1 ? 's' : ''} set`
                                : 'No availability set up'}
                            </p>
                          </div>

                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                            {schedule[day.key].map((slot, index) => (
                              <div key={`${day.key}-${index}`} className="flex items-center gap-2">
                                <Input
                                  type="time"
                                  value={slot.start}
                                  onChange={event =>
                                    setSchedule(current => ({
                                      ...current,
                                      [day.key]: current[day.key].map((item, itemIndex) =>
                                        itemIndex === index
                                          ? { ...item, start: event.target.value }
                                          : item,
                                      ),
                                    }))
                                  }
                                  className="h-10 w-[140px] rounded-[8px] border-[#D9DBE3]"
                                />
                                <span className="text-sm text-[#667085]">to</span>
                                <Input
                                  type="time"
                                  value={slot.end}
                                  onChange={event =>
                                    setSchedule(current => ({
                                      ...current,
                                      [day.key]: current[day.key].map((item, itemIndex) =>
                                        itemIndex === index
                                          ? { ...item, end: event.target.value }
                                          : item,
                                      ),
                                    }))
                                  }
                                  className="h-10 w-[140px] rounded-[8px] border-[#D9DBE3]"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon-lg"
                                  onClick={() =>
                                    setSchedule(current => ({
                                      ...current,
                                      [day.key]: current[day.key].filter((_, itemIndex) => itemIndex !== index),
                                    }))
                                  }
                                  className="h-10 w-10 rounded-[8px] border-[#F1D6D6] text-[#B42318]"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}

                            <Button
                              type="button"
                              size="lg"
                              onClick={() =>
                                setSchedule(current => ({
                                  ...current,
                                  [day.key]: [...current[day.key], { start: '09:00', end: '10:00' }],
                                }))
                              }
                              className="h-10 rounded-[8px] bg-[#22C55E] px-4 text-sm font-semibold text-white hover:bg-[#16A34A]"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Slot
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </section>

            <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[22px] font-bold text-[#111827]">Blocked Dates</h2>
                  <p className="mt-1 text-sm text-[#667085]">
                    Block special dates when appointments should not be allowed.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => blockDateMutation.mutate()}
                  disabled={blockDateMutation.isPending}
                  className="h-10 rounded-[8px] bg-[#F04438] px-4 text-sm font-semibold text-white hover:bg-[#D92D20]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Block Date
                </Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_140px]">
                <Input
                  type="date"
                  value={blockDateValue}
                  onChange={event => setBlockDateValue(event.target.value)}
                  min={getTodayDateValue()}
                  className="h-11 rounded-[8px] border-[#FECACA] bg-[#FFF5F5]"
                />
                <Input
                  value={blockReason}
                  onChange={event => setBlockReason(event.target.value)}
                  placeholder="e.g. On vacation, personal day"
                  className="h-11 rounded-[8px] border-[#FECACA] bg-[#FFF5F5]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setBlockDateValue('')
                    setBlockReason('')
                  }}
                  className="h-11 rounded-[8px] border-[#D9DBE3] bg-white px-4 text-sm text-[#475467]"
                >
                  Cancel
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {blockedDates.length ? (
                  blockedDates.map(blockedDate => (
                    <div
                      key={blockedDate._id}
                      className="flex flex-col gap-3 rounded-[10px] border border-[#FECACA] bg-[#FFF5F5] px-4 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-[#111827]">
                          {formatDate(blockedDate.date)}
                        </p>
                        <p className="mt-1 text-sm text-[#667085]">
                          {blockedDate.reason || 'No reason added'}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => deleteBlockedDateMutation.mutate(blockedDate._id)}
                        className="h-10 rounded-[8px] border-[#F1D6D6] bg-white px-4 text-sm text-[#B42318]"
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#98A2B3]">No block dates</p>
                )}
              </div>
            </section>

            <section className="space-y-5">
              <div>
                <h2 className="text-[22px] font-bold text-[#111827]">Your Appointments</h2>
                <p className="mt-1 text-sm text-[#667085]">
                  Review and manage bookings for your properties.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-5">
                {[
                  { label: 'All', value: counts.all, active: selectedStatus === 'all', color: '#79C5E7', href: createNextUrl({ status: null, page: 1 }) },
                  { label: 'Pending', value: counts.pending, active: selectedStatus === 'pending', color: '#EAAA08', href: createNextUrl({ status: 'pending', page: 1 }) },
                  { label: 'Confirmed', value: counts.confirmed, active: selectedStatus === 'confirmed', color: '#22C55E', href: createNextUrl({ status: 'confirmed', page: 1 }) },
                  { label: 'Completed', value: counts.completed, active: selectedStatus === 'completed', color: '#667085', href: createNextUrl({ status: 'completed', page: 1 }) },
                  { label: 'Cancelled', value: counts.cancelled, active: selectedStatus === 'cancelled', color: '#EF4444', href: createNextUrl({ status: 'cancelled', page: 1 }) },
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
                      <p className="text-[30px] font-semibold text-[#111827]">{item.value}</p>
                      <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    </div>
                    <p className="mt-2 text-sm text-[#667085]">{item.label}</p>
                  </Link>
                ))}
              </div>

              <div className="grid gap-3 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-[0_4px_12px_rgba(16,24,40,0.08)] lg:grid-cols-[140px_minmax(0,1fr)_140px_180px]">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => toast.message('Additional filters are not available yet.')}
                  className="h-11 rounded-[8px] border-[#E5E7EB] bg-white px-4 text-sm text-[#475467]"
                >
                  Filters
                </Button>

                <SearchableSelect
                  value={selectedProperty}
                  onChange={value => router.push(createNextUrl({ property: value, page: 1 }))}
                  options={propertyOptions}
                  placeholder="All Properties"
                  searchPlaceholder="Search properties..."
                />

                <SearchableSelect
                  value={selectedSort}
                  onChange={value => router.push(createNextUrl({ sort: value, page: 1 }))}
                  options={sortOptions}
                  placeholder="Newest"
                  searchPlaceholder="Search order..."
                />

                <Button
                  type="button"
                  onClick={() => {
                    setNewAppointment(current => ({
                      ...current,
                      date: current.date || getTodayDateValue(),
                      time: '',
                    }))
                    setAppointmentDialogOpen(true)
                  }}
                  className="h-11 rounded-[8px] px-4 text-sm font-semibold text-white"
                  style={{
                    background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Appointment
                </Button>
              </div>

              <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
                {appointmentsQuery.isError ? (
                  <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-12 text-center">
                    <CalendarDays className="h-10 w-10 text-[#E53935]" />
                    <h4 className="mt-4 text-xl font-bold text-[#111827]">
                      Couldn&apos;t load appointments
                    </h4>
                    <p className="mt-2 max-w-md text-sm text-[#667085]">
                      {appointmentsQuery.error instanceof Error
                        ? appointmentsQuery.error.message
                        : 'Something went wrong while loading your appointments.'}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => appointmentsQuery.refetch()}
                      className="mt-5 h-10 rounded-[8px] border-[#D9DBE3] bg-white px-4 text-sm text-[#475467]"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try again
                    </Button>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-[#FBFCFD] px-6 py-14 text-center">
                    <CalendarDays className="h-12 w-12 text-[#C7CCD4]" />
                    <h4 className="mt-4 text-[28px] font-bold leading-tight text-[#334155]">
                      No appointments found
                    </h4>
                    <p className="mt-3 max-w-md text-base text-[#667085]">
                      No appointments scheduled yet
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {filteredAppointments.map(appointment => (
                        <article
                          key={appointment._id}
                          className="rounded-[12px] border border-[#EAECEF] bg-[#FCFDFE] p-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-lg font-semibold text-[#111827]">
                                  {appointment.property?.basicInformation?.propertyTitle || 'Untitled property'}
                                </h3>
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                                    statusBadgeClassName[
                                      (appointment.status || 'pending') as AppointmentStatus
                                    ]
                                  }`}
                                >
                                  {appointment.status || 'pending'}
                                </span>
                              </div>

                              <div className="mt-3 grid gap-2 text-sm text-[#667085] md:grid-cols-2">
                                <p>
                                  <span className="font-medium text-[#344054]">Customer:</span>{' '}
                                  {appointment.customerName || 'Unknown'}
                                </p>
                                <p>
                                  <span className="font-medium text-[#344054]">Email:</span>{' '}
                                  {appointment.email || 'N/A'}
                                </p>
                                <p>
                                  <span className="font-medium text-[#344054]">Phone:</span>{' '}
                                  {appointment.phone || 'N/A'}
                                </p>
                                <p>
                                  <span className="font-medium text-[#344054]">Date:</span>{' '}
                                  {formatDate(appointment.date)} at {appointment.time || 'N/A'}
                                </p>
                              </div>

                              {appointment.notes ? (
                                <div className="mt-4 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3">
                                  <p className="text-sm leading-6 text-[#344054]">
                                    {appointment.notes}
                                  </p>
                                </div>
                              ) : null}
                            </div>

                            <div className="flex w-full flex-col gap-3 lg:w-[230px]">
                              <SearchableSelect
                                value={appointment.status || 'pending'}
                                onChange={value =>
                                  appointmentStatusMutation.mutate({
                                    appointmentId: appointment._id,
                                    nextStatus: value as AppointmentStatus,
                                  })
                                }
                                options={[
                                  { label: 'Pending', value: 'pending' },
                                  { label: 'Confirmed', value: 'confirmed' },
                                  { label: 'Completed', value: 'completed' },
                                  { label: 'Cancelled', value: 'cancelled' },
                                ]}
                                placeholder="Update status"
                                searchPlaceholder="Search status..."
                              />

                              <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={() => deleteAppointmentMutation.mutate(appointment._id)}
                                className="h-11 rounded-[8px] border-[#F1D6D6] bg-white px-4 text-sm text-[#B42318]"
                              >
                                Delete Appointment
                              </Button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

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
            </section>
          </div>
        </section>
      </div>

      <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
        <DialogContent className="max-w-[560px] rounded-[12px] border border-[#E5E7EB] bg-white p-0" showCloseButton={false}>
          <div className="p-5">
            <DialogHeader className="relative pr-10">
              <button
                type="button"
                onClick={() => setAppointmentDialogOpen(false)}
                className="absolute right-0 top-0 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
                aria-label="Close add appointment modal"
              >
                <X className="h-4 w-4" />
              </button>
              <DialogTitle className="text-lg font-bold text-[#111827]">Add Appointment</DialogTitle>
              <DialogDescription className="text-sm text-[#4B5563]">
                Create a new appointment using your available property slots.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#374151]">Property</label>
                <SearchableSelect
                  value={newAppointment.propertyId}
                  onChange={value =>
                    setNewAppointment(current => ({
                      ...current,
                      propertyId: value,
                      time: '',
                    }))
                  }
                  options={propertyOptions.filter(option => option.value !== 'all')}
                  placeholder="Select a property"
                  searchPlaceholder="Search properties..."
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#374151]">Date</label>
                  <Input
                    type="date"
                    value={newAppointment.date}
                    min={getTodayDateValue()}
                    onChange={event =>
                      setNewAppointment(current => ({
                        ...current,
                        date: event.target.value,
                        time: '',
                      }))
                    }
                    className="h-11 rounded-[8px] border-[#D9DBE3]"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#374151]">Time</label>
                  <SearchableSelect
                    value={newAppointment.time}
                    onChange={value =>
                      setNewAppointment(current => ({
                        ...current,
                        time: normalizeTimeValue(value),
                      }))
                    }
                    options={availableSlots.map(slot => ({
                      label: `${slot.start} - ${slot.end}`,
                      value: normalizeTimeValue(slot.start),
                    }))}
                    placeholder={
                      availableSlotsQuery.data?.data.available === false
                        ? availableSlotsQuery.data.data.reason || 'No available slots'
                        : newAppointment.date === getTodayDateValue() && availableSlots.length === 0
                          ? 'No time slots available from current time'
                        : 'Select a time'
                    }
                    searchPlaceholder="Search available time..."
                    emptyLabel={
                      newAppointment.date === getTodayDateValue()
                        ? 'No time slots available from current time'
                        : 'No options found'
                    }
                    disabled={!newAppointment.propertyId || !newAppointment.date || availableSlots.length === 0}
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#374151]">Customer Name</label>
                  <Input
                    value={newAppointment.customerName}
                    onChange={event =>
                      setNewAppointment(current => ({
                        ...current,
                        customerName: event.target.value,
                      }))
                    }
                    placeholder="John Doe"
                    className="h-11 rounded-[8px] border-[#D9DBE3]"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#374151]">Email</label>
                  <Input
                    value={newAppointment.email}
                    onChange={event =>
                      setNewAppointment(current => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="john@email.com"
                    className="h-11 rounded-[8px] border-[#D9DBE3]"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#374151]">Phone Number</label>
                <Input
                  value={newAppointment.phone}
                  onChange={event =>
                    setNewAppointment(current => ({
                      ...current,
                      phone: event.target.value.replace(/\D/g, ''),
                    }))
                  }
                  placeholder="01234567890"
                  className="h-11 rounded-[8px] border-[#D9DBE3]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#374151]">Notes (optional)</label>
                <Textarea
                  value={newAppointment.notes}
                  onChange={event =>
                    setNewAppointment(current => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Any additional information..."
                  className="min-h-[110px] rounded-[8px] border-[#D9DBE3]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#F1F5F9] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-start">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setAppointmentDialogOpen(false)}
              className="h-10 rounded-[8px] border-[#D9DBE3] bg-white px-4 text-sm text-[#374151]"
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={() => createAppointmentMutation.mutate()}
              disabled={createAppointmentMutation.isPending}
              className="inline-flex h-10 items-center justify-center rounded-[8px] px-4 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
              }}
            >
              {createAppointmentMutation.isPending ? 'Adding Appointment...' : 'Add Appointment'}
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

export default function DashboardAppointmentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3f5f7]" />}>
      <DashboardAppointmentsPageContent />
    </Suspense>
  )
}
