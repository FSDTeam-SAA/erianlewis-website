'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  ArrowLeft,
  ExternalLink,
  Home,
  MapPinned,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  SearchableSelect,
  type SearchableSelectOption,
} from '@/components/shared/SearchableSelect'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

type CategoryOption = {
  _id: string
  name: string
  status?: string
}

type IslandOption = {
  _id: string
  name: string
}

type IslandsResponse = {
  status: boolean
  message: string
  data: {
    islands: IslandOption[]
  }
}

type CategoriesResponse = {
  status: boolean
  message: string
  data: CategoryOption[]
}

type RentalPropertyResponse = {
  status: boolean
  message: string
  data: {
    _id: string
    listingType?: 'rent' | 'buy'
    basicInformation?: {
      propertyTitle?: string
      details?: string
      propertyType?: { _id?: string; name?: string } | string
      monthlyRent?: number
      preferredCurrency?: string
    }
    address?: {
      streetNumber?: string
      cityTown?: string
      island?: { _id?: string; name?: string } | string | null
    }
    location?: {
      lat?: number | null
      lng?: number | null
    }
    propertyDetails?: {
      bedrooms?: number
      bathrooms?: number
      squareFeet?: number
      lotSizeSqFt?: number
      yearBuilt?: number
      parkingSpaces?: number
      commercialPropertyType?: string
      totalBuildingSizeSqFt?: number
      numberOfFloors?: number
      numberOfUnitsSuites?: number
    }
    rentalTerms?: {
      leaseTerm?: {
        monthToMonth?: boolean
        sixMonths?: boolean
        twelveMonths?: boolean
        other?: boolean
        otherText?: string
      }
      additional?: {
        utilitiesIncluded?: boolean
        furnished?: boolean
        petFriendly?: boolean
      }
    }
    amenities?: {
      amenities?: string[]
      parkingType?: string
      hoaFeesMonthly?: number
      propertyTaxAmount?: number
    }
    propertyTaxAnnual?: number
    unitDetails?: Array<{
      unitType?: string
      sqFt?: number
      baseRent?: number
    }>
    photos?: Array<{
      url?: string
    }>
  }
}

type UnitDetail = {
  unitType: string
  sqFt: string
  baseRent: string
}

type FormState = {
  propertyTitle: string
  details: string
  propertyType: string
  monthlyRent: string
  preferredCurrency: string
  hideExactLocation: boolean
  streetAddress: string
  cityTown: string
  island: string
  lat: string
  lng: string
  mapConfirmed: boolean
  bedrooms: string
  bathrooms: string
  squareFeet: string
  lotSizeSqFt: string
  yearBuilt: string
  parkingSpaces: string
  commercialPropertyType: string
  totalBuildingSizeSqFt: string
  numberOfFloors: string
  numberOfUnitsSuites: string
  leaseMonthToMonth: boolean
  leaseSixMonths: boolean
  leaseTwelveMonths: boolean
  leaseOther: boolean
  leaseOtherText: string
  utilitiesIncluded: boolean
  furnished: boolean
  petFriendly: boolean
  amenities: string[]
  parkingType: string
  hoaFeesMonthly: string
  propertyTaxAnnual: string
  unitDetails: UnitDetail[]
}

const AMENITY_OPTIONS = [
  'Air conditioning',
  'Ceiling fans',
  'Hardwood floors',
  'Tile floors',
  'Balcony',
  'Yard',
  'Garage',
  'Washer',
  'In unit laundry',
  'Heating',
  'Fireplace',
  'Carpet',
  'Walk in closets',
  'Patio',
  'Fenced yard',
  'Driveway',
  'Dryer',
  'Dishwasher',
  'Refrigerator',
  'Oven or range',
  'Microwave',
  'Security system',
]

const PARKING_OPTIONS: SearchableSelectOption[] = [
  { label: 'Select parking type', value: '' },
  { label: 'No Parking', value: 'No Parking' },
  { label: 'Street Parking', value: 'Street Parking' },
  { label: 'Carport', value: 'Carport' },
  { label: 'Covered Parking', value: 'Covered Parking' },
  { label: 'Garage', value: 'Garage' },
  { label: 'Reserved Parking', value: 'Reserved Parking' },
  { label: 'Open parking Lot', value: 'Open parking Lot' },
  { label: 'Other', value: 'Other' },
]

const CURRENCY_OPTIONS: SearchableSelectOption[] = [
  { label: 'AED - United Arab Emirates Dirham', value: 'AED' },
  { label: 'AFN - Afghanistan Afghani', value: 'AFN' },
  { label: 'ALL - Albania Lek', value: 'ALL' },
  { label: 'AMD - Armenian Dram', value: 'AMD' },
]

const UNIT_TYPE_OPTIONS = [
  'Studio',
  'Loft',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  'Penthouse',
]

const cardClassName =
  'rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]'

const defaultUnitDetails = (): UnitDetail[] => [
  { unitType: 'Studio', sqFt: '', baseRent: '' },
]

const defaultFormState = (): FormState => ({
  propertyTitle: '',
  details: '',
  propertyType: '',
  monthlyRent: '',
  preferredCurrency: 'AED',
  hideExactLocation: false,
  streetAddress: '',
  cityTown: '',
  island: '',
  lat: '',
  lng: '',
  mapConfirmed: false,
  bedrooms: '',
  bathrooms: '',
  squareFeet: '',
  lotSizeSqFt: '',
  yearBuilt: '',
  parkingSpaces: '',
  commercialPropertyType: '',
  totalBuildingSizeSqFt: '',
  numberOfFloors: '',
  numberOfUnitsSuites: '',
  leaseMonthToMonth: false,
  leaseSixMonths: false,
  leaseTwelveMonths: false,
  leaseOther: false,
  leaseOtherText: '',
  utilitiesIncluded: false,
  furnished: false,
  petFriendly: false,
  amenities: [],
  parkingType: 'Covered Parking',
  hoaFeesMonthly: '',
  propertyTaxAnnual: '',
  unitDetails: defaultUnitDetails(),
})

const toNumber = (value: string) => {
  if (!value.trim()) return 0

  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

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

const buildGoogleMapsUrl = (lat?: string, lng?: string, query?: string) => {
  if (lat && lng) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=15&output=embed`
  }

  if (query?.trim()) {
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`
  }

  return 'https://www.google.com/maps?q=Caribbean&z=4&output=embed'
}

const normalizeLocationQuery = (...parts: Array<string | undefined>) =>
  parts
    .map(part => part?.trim())
    .filter(Boolean)
    .join(', ')
    .replace(/\s+/g, ' ')
    .trim()

const uniqueQueries = (queries: string[]) =>
  Array.from(new Set(queries.map(query => query.trim()).filter(Boolean)))

function ListPropertyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const token = session?.user?.accessToken
  const listingId = searchParams.get('id')
  const isEditMode = Boolean(listingId)
  const requestedListingType = searchParams.get('listingType') === 'buy' ? 'buy' : 'rent'

  const [form, setForm] = useState<FormState>(defaultFormState)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([])
  const [isResolvingMap, setIsResolvingMap] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') {
      return
    }

    if (session.user?.role === 'USER') {
      router.replace('/account')
    }
  }, [router, session, status])

  useEffect(() => {
    const urls = selectedFiles.map(file => URL.createObjectURL(file))
    setPhotoPreviewUrls(urls)

    return () => {
      urls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [selectedFiles])

  const categoriesQuery = useQuery({
    queryKey: ['create-rental-categories'],
    queryFn: () => fetchJson<CategoriesResponse>('/categories', token),
    enabled: status === 'authenticated',
  })

  const islandsQuery = useQuery({
    queryKey: ['create-rental-islands'],
    queryFn: () =>
      fetchJson<IslandsResponse>('/islands?page=1&limit=100', token),
    enabled: status === 'authenticated',
  })

  const propertyQuery = useQuery({
    queryKey: ['edit-rental-property', listingId, token],
    queryFn: () =>
      fetchJson<RentalPropertyResponse>(`/rental-properties/${listingId}`, token),
    enabled: status === 'authenticated' && Boolean(listingId),
  })

  const categoryOptions = useMemo<SearchableSelectOption[]>(
    () => [
      { label: 'Select Type', value: '' },
      ...(categoriesQuery.data?.data || [])
        .filter(option => option.status !== 'inactive')
        .map(option => ({
          label: option.name,
          value: option._id,
        })),
    ],
    [categoriesQuery.data?.data],
  )

  const islandOptions = useMemo<SearchableSelectOption[]>(
    () => [
      { label: 'Select Island', value: '' },
      ...(islandsQuery.data?.data.islands || [])
        .slice()
        .sort((first, second) => first.name.localeCompare(second.name))
        .map(option => ({
          label: option.name,
          value: option._id,
        })),
    ],
    [islandsQuery.data?.data.islands],
  )

  const selectedPropertyTypeLabel = useMemo(
    () =>
      categoryOptions.find(option => option.value === form.propertyType)
        ?.label || '',
    [categoryOptions, form.propertyType],
  )

  const selectedIslandLabel = useMemo(
    () =>
      islandOptions.find(option => option.value === form.island)?.label || '',
    [form.island, islandOptions],
  )

  const currentListingType =
    isEditMode && propertyQuery.data?.data?.listingType
      ? propertyQuery.data.data.listingType
      : requestedListingType
  const isSaleMode = currentListingType === 'buy'
  const listingLabel = isSaleMode ? 'sale' : 'rental'
  const listingTitle = isSaleMode ? 'Property for Sale' : 'Rental Property'
  const dashboardBaseRoute = isSaleMode ? '/dashboard/sales' : '/dashboard/rentals'
  const priceFieldLabel = isSaleMode ? 'Sale Price*' : 'Monthly Rent*'
  const priceFieldPlaceholder = isSaleMode ? '00000' : '0000'

  const isCommercial = /commercial/i.test(selectedPropertyTypeLabel)

  const mapQuery = [form.streetAddress, form.cityTown, selectedIslandLabel]
    .filter(Boolean)
    .join(', ')

  const mapEmbedUrl = useMemo(
    () => buildGoogleMapsUrl(form.lat, form.lng, mapQuery),
    [form.lat, form.lng, mapQuery],
  )

  useEffect(() => {
    if (!propertyQuery.data?.data || !isEditMode) {
      return
    }

    const property = propertyQuery.data.data
    const propertyTypeValue =
      typeof property.basicInformation?.propertyType === 'object'
        ? property.basicInformation?.propertyType?._id ||
          property.basicInformation?.propertyType?.name ||
          ''
        : property.basicInformation?.propertyType || ''
    const islandValue =
      typeof property.address?.island === 'object'
        ? property.address?.island?._id || ''
        : property.address?.island || ''

    setForm({
      propertyTitle: property.basicInformation?.propertyTitle || '',
      details: property.basicInformation?.details || '',
      propertyType: propertyTypeValue,
      monthlyRent: property.basicInformation?.monthlyRent?.toString() || '',
      preferredCurrency:
        property.basicInformation?.preferredCurrency || 'AED',
      hideExactLocation: false,
      streetAddress: property.address?.streetNumber || '',
      cityTown: property.address?.cityTown || '',
      island: islandValue,
      lat:
        property.location?.lat !== null && property.location?.lat !== undefined
          ? String(property.location.lat)
          : '',
      lng:
        property.location?.lng !== null && property.location?.lng !== undefined
          ? String(property.location.lng)
          : '',
      mapConfirmed: Boolean(
        property.location?.lat !== null &&
          property.location?.lat !== undefined &&
          property.location?.lng !== null &&
          property.location?.lng !== undefined,
      ),
      bedrooms: property.propertyDetails?.bedrooms?.toString() || '',
      bathrooms: property.propertyDetails?.bathrooms?.toString() || '',
      squareFeet: property.propertyDetails?.squareFeet?.toString() || '',
      lotSizeSqFt: property.propertyDetails?.lotSizeSqFt?.toString() || '',
      yearBuilt: property.propertyDetails?.yearBuilt?.toString() || '',
      parkingSpaces: property.propertyDetails?.parkingSpaces?.toString() || '',
      commercialPropertyType:
        property.propertyDetails?.commercialPropertyType || '',
      totalBuildingSizeSqFt:
        property.propertyDetails?.totalBuildingSizeSqFt?.toString() || '',
      numberOfFloors: property.propertyDetails?.numberOfFloors?.toString() || '',
      numberOfUnitsSuites:
        property.propertyDetails?.numberOfUnitsSuites?.toString() || '',
      leaseMonthToMonth:
        property.rentalTerms?.leaseTerm?.monthToMonth || false,
      leaseSixMonths: property.rentalTerms?.leaseTerm?.sixMonths || false,
      leaseTwelveMonths:
        property.rentalTerms?.leaseTerm?.twelveMonths || false,
      leaseOther: property.rentalTerms?.leaseTerm?.other || false,
      leaseOtherText: property.rentalTerms?.leaseTerm?.otherText || '',
      utilitiesIncluded:
        property.rentalTerms?.additional?.utilitiesIncluded || false,
      furnished: property.rentalTerms?.additional?.furnished || false,
      petFriendly: property.rentalTerms?.additional?.petFriendly || false,
      amenities: property.amenities?.amenities || [],
      parkingType: property.amenities?.parkingType || 'Covered Parking',
      hoaFeesMonthly: property.amenities?.hoaFeesMonthly?.toString() || '',
      propertyTaxAnnual:
        property.propertyTaxAnnual?.toString() ||
        property.amenities?.propertyTaxAmount?.toString() ||
        '',
      unitDetails:
        property.unitDetails?.length
          ? property.unitDetails.map(item => ({
              unitType: item.unitType || '',
              sqFt: item.sqFt?.toString() || '',
              baseRent: item.baseRent?.toString() || '',
            }))
          : defaultUnitDetails(),
    })

    setExistingPhotoUrls(
      (property.photos || []).map(item => item.url).filter(Boolean) as string[],
    )
  }, [isEditMode, propertyQuery.data])

  const resolveCoordinates = async () => {
    const fullQuery = normalizeLocationQuery(
      form.streetAddress,
      form.cityTown,
      selectedIslandLabel,
    )

    if (!fullQuery) {
      throw new Error(
        'Enter street, city, and island before setting the map pin.',
      )
    }

    const fallbackQueries = uniqueQueries([
      fullQuery,
      normalizeLocationQuery(form.streetAddress, form.cityTown, selectedIslandLabel, 'Caribbean'),
      normalizeLocationQuery(form.cityTown, selectedIslandLabel),
      normalizeLocationQuery(form.cityTown, selectedIslandLabel, 'Caribbean'),
      normalizeLocationQuery(form.streetAddress, selectedIslandLabel),
      normalizeLocationQuery(selectedIslandLabel, 'Caribbean'),
      normalizeLocationQuery(form.cityTown, 'Caribbean'),
    ])

    for (const query of fallbackQueries) {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )

      if (!response.ok) {
        continue
      }

      const results = (await response.json()) as Array<{
        lat?: string
        lon?: string
      }>
      const firstResult = results[0]

      if (firstResult?.lat && firstResult?.lon) {
        return {
          lat: firstResult.lat,
          lng: firstResult.lon,
        }
      }
    }

    throw new Error(
      'We could not find that address on the map. Try a shorter street address or set city and island first.',
    )
  }

  const createListingMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error('You need to sign in again to continue.')
      }

      if (!form.propertyTitle.trim())
        throw new Error('Property title is required.')
      if (!form.propertyType) throw new Error('Property type is required.')
      if (!form.monthlyRent.trim()) {
        throw new Error(isSaleMode ? 'Sale price is required.' : 'Monthly rent is required.')
      }
      if (!form.preferredCurrency)
        throw new Error('Preferred currency is required.')
      if (!form.streetAddress.trim())
        throw new Error('Street address is required.')
      if (!form.cityTown.trim()) throw new Error('City or town is required.')
      if (!form.island) throw new Error('Island is required.')
      if (!selectedFiles.length && !existingPhotoUrls.length)
        throw new Error('At least one photo is required.')

      let nextLat = form.lat
      let nextLng = form.lng

      if (!nextLat || !nextLng) {
        const coordinates = await resolveCoordinates()
        nextLat = coordinates.lat
        nextLng = coordinates.lng
        setForm(current => ({
          ...current,
          lat: coordinates.lat,
          lng: coordinates.lng,
          mapConfirmed: true,
        }))
      }

      if (!form.mapConfirmed && !(nextLat && nextLng)) {
        throw new Error(
          `Set the map pin before ${isEditMode ? 'saving changes' : 'creating the listing'}.`,
        )
      }

      const payload = new FormData()

      payload.append(
        'basicInformation',
        JSON.stringify({
          propertyTitle: form.propertyTitle.trim(),
          details: form.details.trim(),
          propertyType: form.propertyType,
          monthlyRent: toNumber(form.monthlyRent),
          preferredCurrency: form.preferredCurrency,
        }),
      )

      payload.append(
        'address',
        JSON.stringify({
          streetNumber: form.streetAddress.trim(),
          cityTown: form.cityTown.trim(),
          island: form.island,
        }),
      )

      payload.append(
        'location',
        JSON.stringify({
          lat: Number(nextLat),
          lng: Number(nextLng),
        }),
      )

      payload.append(
        'propertyDetails',
        JSON.stringify({
          bedrooms: toNumber(form.bedrooms),
          bathrooms: toNumber(form.bathrooms),
          squareFeet: toNumber(form.squareFeet),
          lotSizeSqFt: toNumber(form.lotSizeSqFt),
          yearBuilt: toNumber(form.yearBuilt),
          parkingSpaces: toNumber(form.parkingSpaces),
          commercialPropertyType: form.commercialPropertyType.trim(),
          totalBuildingSizeSqFt: toNumber(form.totalBuildingSizeSqFt),
          numberOfFloors: toNumber(form.numberOfFloors),
          numberOfUnitsSuites: toNumber(form.numberOfUnitsSuites),
        }),
      )

      payload.append(
        'rentalTerms',
        JSON.stringify({
          leaseTerm: {
            monthToMonth: form.leaseMonthToMonth,
            sixMonths: form.leaseSixMonths,
            twelveMonths: form.leaseTwelveMonths,
            other: form.leaseOther,
            otherText: form.leaseOtherText.trim(),
          },
          additional: {
            utilitiesIncluded: form.utilitiesIncluded,
            furnished: form.furnished,
            petFriendly: form.petFriendly,
          },
        }),
      )

      payload.append(
        'amenities',
        JSON.stringify({
          amenities: form.amenities,
          parkingType: form.parkingType,
          hoaFeesMonthly: toNumber(form.hoaFeesMonthly),
          propertyTaxAmount: toNumber(form.propertyTaxAnnual),
        }),
      )

      payload.append(
        'propertyTaxAnnual',
        String(toNumber(form.propertyTaxAnnual)),
      )
      payload.append(
        'unitDetails',
        JSON.stringify(
          form.unitDetails
            .filter(item => item.unitType.trim())
            .map(item => ({
              unitType: item.unitType.trim(),
              sqFt: toNumber(item.sqFt),
              baseRent: toNumber(item.baseRent),
            })),
        ),
      )
      payload.append('listingType', currentListingType)

      selectedFiles.forEach(file => {
        payload.append('photos', file)
      })

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/rental-properties${
          isEditMode && listingId ? `/${listingId}` : ''
        }`,
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        },
      )

      const result = await response.json()

      if (!response.ok || !result?.status) {
        throw new Error(
          result?.message ||
            `Failed to ${isEditMode ? 'update' : 'create'} ${listingLabel} property`,
        )
      }

      return result
    },
    onSuccess: result => {
      toast.success(
        result?.message ||
          `${listingTitle} ${isEditMode ? 'updated' : 'created'} successfully.`,
      )
      router.push(dashboardBaseRoute)
    },
    onError: error => {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditMode ? 'update' : 'create'} ${listingLabel} property.`,
      )
    },
  })

  const updateAmenity = (amenity: string, checked: boolean) => {
    setForm(current => ({
      ...current,
      amenities: checked
        ? [...current.amenities, amenity]
        : current.amenities.filter(item => item !== amenity),
    }))
  }

  const updateUnitDetail = (
    index: number,
    field: keyof UnitDetail,
    value: string,
  ) => {
    setForm(current => ({
      ...current,
      unitDetails: current.unitDetails.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  const addUnitRow = () => {
    setForm(current => ({
      ...current,
      unitDetails: [
        ...current.unitDetails,
        { unitType: '', sqFt: '', baseRent: '' },
      ],
    }))
  }

  const removeUnitRow = (index: number) => {
    setForm(current => ({
      ...current,
      unitDetails:
        current.unitDetails.length === 1
          ? current.unitDetails
          : current.unitDetails.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const handleMapPin = async () => {
    try {
      setIsResolvingMap(true)
      const coordinates = await resolveCoordinates()
      setForm(current => ({
        ...current,
        lat: coordinates.lat,
        lng: coordinates.lng,
        mapConfirmed: true,
      }))
      toast.success('Map pin updated.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Map lookup failed.')
    } finally {
      setIsResolvingMap(false)
    }
  }

  const removePhoto = (index: number) => {
    setSelectedFiles(current =>
      current.filter((_, itemIndex) => itemIndex !== index),
    )
  }

  const loadingScreen =
    status === 'loading' ||
    (status === 'authenticated' &&
      (categoriesQuery.isLoading ||
        islandsQuery.isLoading ||
        (isEditMode && propertyQuery.isLoading)))

  if (loadingScreen) {
    return (
      <main className="min-h-screen bg-[#F7F8FA]">
        <div className="border-b border-[#E5E7EB] bg-white">
          <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-4 md:px-8">
            <Skeleton className="h-5 w-32 rounded-[8px]" />
            <Skeleton className="h-5 w-28 rounded-[8px]" />
          </div>
        </div>
        <div className="mx-auto max-w-[1180px] space-y-6 px-4 py-8 md:px-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 rounded-[8px]" />
            <Skeleton className="h-4 w-48 rounded-[8px]" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={cardClassName}>
              <div className="space-y-4">
                <Skeleton className="h-6 w-40 rounded-[8px]" />
                <Skeleton className="h-10 w-full rounded-[8px]" />
                <Skeleton className="h-10 w-full rounded-[8px]" />
                <Skeleton className="h-32 w-full rounded-[8px]" />
              </div>
            </div>
          ))}
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4">
        <div className="container mx-auto rounded-[24px] border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#98A2B3]">
            Dashboard
          </p>
          <h1 className="mt-3 text-2xl font-bold text-[#111827]">
            Sign in to continue
          </h1>
          <p className="mt-2 text-sm text-[#667085]">
            You need an authenticated landlord or agent account to continue.
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

  if (categoriesQuery.isError || islandsQuery.isError) {
    return (
      <main className="min-h-screen bg-[#F7F8FA]">
        <div className="mx-auto flex min-h-screen max-w-[1180px] items-center justify-center px-4 md:px-8">
          <div className="w-full max-w-xl rounded-[18px] border border-[#FECACA] bg-white p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <h1 className="text-2xl font-bold text-[#111827]">
              Couldn&apos;t load property setup data
            </h1>
            <p className="mt-3 text-sm text-[#667085]">
              We couldn&apos;t load the property types or island list right now.
              Please try again.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  categoriesQuery.refetch()
                  islandsQuery.refetch()
                }}
                className="h-11 rounded-[8px] border-[#D9DBE3] bg-white px-5 text-sm text-[#475467]"
              >
                Try again
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push(dashboardBaseRoute)}
                className="h-11 rounded-[8px] border-[#D9DBE3] bg-white px-5 text-sm text-[#475467]"
              >
                {isSaleMode ? 'Back to Sales' : 'Back to Rentals'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (propertyQuery.isError) {
    return (
      <main className="min-h-screen bg-[#F7F8FA]">
        <div className="mx-auto flex min-h-screen max-w-[1180px] items-center justify-center px-4 md:px-8">
          <div className="w-full max-w-xl rounded-[18px] border border-[#FECACA] bg-white p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <h1 className="text-2xl font-bold text-[#111827]">
              Couldn&apos;t load this {listingLabel} property
            </h1>
            <p className="mt-3 text-sm text-[#667085]">
              The property could not be loaded for editing right now.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => propertyQuery.refetch()}
                className="h-11 rounded-[8px] border-[#D9DBE3] bg-white px-5 text-sm text-[#475467]"
              >
                Try again
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push(dashboardBaseRoute)}
                className="h-11 rounded-[8px] border-[#D9DBE3] bg-white px-5 text-sm text-[#475467]"
              >
                {isSaleMode ? 'Back to Sales' : 'Back to Rentals'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <div className="mx-auto max-w-[1180px] px-4 pb-8 pt-6 md:px-8">
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white shadow-[0_4px_12px_rgba(16,24,40,0.06)]">
          <div className="flex items-center justify-between px-5 py-4 text-sm md:px-6">
            <button
              type="button"
              onClick={() => router.push(dashboardBaseRoute)}
              className="inline-flex items-center gap-2 font-medium text-[#344054]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 font-medium text-[#667085]"
            >
              <Home className="h-4 w-4" />
              Go to Home Page
            </Link>
          </div>
        </div>

        <section className="mt-6 rounded-[12px] border border-[#E5E7EB] bg-white px-5 py-6 shadow-[0_4px_12px_rgba(16,24,40,0.06)] md:px-6">
          <h1 className="text-[38px] font-bold leading-tight text-[#111827]">
            {isEditMode ? `Edit ${listingTitle}` : `Add ${listingTitle}`}
          </h1>
          <p className="mt-2 text-sm text-[#667085]">
            {isEditMode
              ? `Update the details of your ${listingLabel} property`
              : `Fill in the details of your ${listingLabel} property`}
          </p>
        </section>

        <div className="mt-6 space-y-6">
        <section className={cardClassName}>
          <h2 className="text-2xl font-bold text-[#111827]">
            Basic Information
          </h2>
          <div className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#344054]">
                Property Title*
              </label>
              <Input
                value={form.propertyTitle}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    propertyTitle: event.target.value,
                  }))
                }
                placeholder="e.g. name of property"
                className="h-11 rounded-[8px] border-[#D9DBE3]"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#344054]">
                Details
              </label>
              <Textarea
                value={form.details}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    details: event.target.value,
                  }))
                }
                placeholder="Describe your property..."
                className="min-h-[120px] rounded-[8px] border-[#D9DBE3]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#344054]">
                  Property Type*
                </label>
                <SearchableSelect
                  value={form.propertyType}
                  onChange={value =>
                    setForm(current => ({ ...current, propertyType: value }))
                  }
                  options={categoryOptions}
                  placeholder="Select Type"
                  searchPlaceholder="Search property types..."
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#344054]">
                  {priceFieldLabel}
                </label>
                <Input
                  type="number"
                  min="0"
                  value={form.monthlyRent}
                  onChange={event =>
                    setForm(current => ({
                      ...current,
                      monthlyRent: event.target.value,
                    }))
                  }
                  placeholder={priceFieldPlaceholder}
                  className="h-11 rounded-[8px] border-[#D9DBE3]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#344054]">
                  Preferred Currency*
                </label>
                <SearchableSelect
                  value={form.preferredCurrency}
                  onChange={value =>
                    setForm(current => ({
                      ...current,
                      preferredCurrency: value,
                    }))
                  }
                  options={CURRENCY_OPTIONS}
                  placeholder="Select currency"
                  searchPlaceholder="Search currency..."
                />
              </div>
            </div>
          </div>
        </section>

        <section className={cardClassName}>
          <h2 className="text-2xl font-bold text-[#111827]">Location</h2>
          <div className="mt-5 space-y-4">
            <label className="flex items-start gap-3 rounded-[8px] border border-[#EAECEF] bg-[#FAFBFC] px-4 py-3">
              <Checkbox
                checked={form.hideExactLocation}
                onCheckedChange={checked =>
                  setForm(current => ({
                    ...current,
                    hideExactLocation: Boolean(checked),
                  }))
                }
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-[#344054]">
                  Hide exact location until a viewing is confirmed
                </p>
                <p className="mt-1 text-xs text-[#667085]">
                  When enabled, the listing page shows a blurred map with
                  &quot;Book an appointment to reveal&quot;.
                </p>
              </div>
            </label>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#344054]">
                  Street Address*
                </label>
                <Input
                  value={form.streetAddress}
                  onChange={event =>
                    setForm(current => ({
                      ...current,
                      streetAddress: event.target.value,
                    }))
                  }
                  placeholder="123 main street"
                  className="h-11 rounded-[8px] border-[#D9DBE3]"
                />
                <p className="text-xs text-[#667085]">
                  If there&apos;s no formal street number, a nearby landmark
                  works great.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#344054]">
                    City/Town*
                  </label>
                  <Input
                    value={form.cityTown}
                    onChange={event =>
                      setForm(current => ({
                        ...current,
                        cityTown: event.target.value,
                      }))
                    }
                    placeholder="e.g. The valley"
                    className="h-11 rounded-[8px] border-[#D9DBE3]"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#344054]">
                    Island*
                  </label>
                  <SearchableSelect
                    value={form.island}
                    onChange={value =>
                      setForm(current => ({ ...current, island: value }))
                    }
                    options={islandOptions}
                    placeholder="Select Island"
                    searchPlaceholder="Search island..."
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[12px] border border-[#E5E7EB]">
              <div className="flex flex-col gap-3 border-b border-[#EEF2F6] px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <MapPinned className="h-5 w-5 text-[#8BCCE6]" />
                  <div>
                    <p className="font-semibold text-[#344054]">
                      Pin Location(Required)
                    </p>
                    <p className="text-xs text-[#667085]">
                      Use your address to place the property pin, then verify it
                      below.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleMapPin}
                    disabled={isResolvingMap}
                    className="h-10 rounded-[8px] border-[#D9DBE3] bg-white px-4 text-sm text-[#475467]"
                  >
                    {isResolvingMap ? 'Setting Pin...' : 'Set pin on Maps'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      setForm(current => ({
                        ...current,
                        lat: '',
                        lng: '',
                        mapConfirmed: false,
                      }))
                    }
                    className="h-10 rounded-[8px] border-[#D9DBE3] bg-white px-4 text-sm text-[#475467]"
                  >
                    Clear Pin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      const target =
                        form.lat && form.lng
                          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${form.lat},${form.lng}`,
                            )}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              mapQuery || 'Caribbean',
                            )}`

                      window.open(target, '_blank', 'noopener,noreferrer')
                    }}
                    className="h-10 rounded-[8px] border-[#D9DBE3] bg-white px-4 text-sm text-[#475467]"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Map
                  </Button>
                </div>
              </div>

              <div className="px-4 py-4">
                <div className="overflow-hidden rounded-[12px] border border-[#D9E4EC]">
                  <iframe
                    title="Property map preview"
                    src={mapEmbedUrl}
                    className="h-[270px] w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div className="mt-3 flex flex-col gap-3 rounded-[8px] border border-[#EAECEF] bg-[#FAFBFC] px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <label className="flex items-start gap-3">
                    <Checkbox
                      checked={form.mapConfirmed}
                      onCheckedChange={checked =>
                        setForm(current => ({
                          ...current,
                          mapConfirmed: Boolean(checked),
                        }))
                      }
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#344054]">
                        The map pin above accurately shows the property location
                      </p>
                      <p className="mt-1 text-xs text-[#667085]">
                        Required before you can publish this listing.
                      </p>
                    </div>
                  </label>

                  {form.lat && form.lng ? (
                    <div className="text-xs font-medium text-[#667085]">
                      {Number(form.lat).toFixed(5)},{' '}
                      {Number(form.lng).toFixed(5)}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={cardClassName}>
          <h2 className="text-2xl font-bold text-[#111827]">
            Property Details
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              ['Bedrooms', 'bedrooms'],
              ['Bathrooms', 'bathrooms'],
              ['Square Feet', 'squareFeet'],
              ['Lot Size (sq ft)', 'lotSizeSqFt'],
              ['Year Built', 'yearBuilt'],
              ['Parking Spaces', 'parkingSpaces'],
            ].map(([label, key]) => (
              <div key={key} className="grid gap-2">
                <label className="text-sm font-semibold text-[#344054]">
                  {label}
                </label>
                <Input
                  type="number"
                  min="0"
                  value={form[key as keyof FormState] as string}
                  onChange={event =>
                    setForm(current => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  placeholder="0"
                  className="h-11 rounded-[8px] border-[#D9DBE3]"
                />
              </div>
            ))}
          </div>

          {isCommercial ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#344054]">
                  Commercial Property Type
                </label>
                <Input
                  value={form.commercialPropertyType}
                  onChange={event =>
                    setForm(current => ({
                      ...current,
                      commercialPropertyType: event.target.value,
                    }))
                  }
                  placeholder="Office Building"
                  className="h-11 rounded-[8px] border-[#D9DBE3]"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#344054]">
                  Total Building Size (sq ft)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={form.totalBuildingSizeSqFt}
                  onChange={event =>
                    setForm(current => ({
                      ...current,
                      totalBuildingSizeSqFt: event.target.value,
                    }))
                  }
                  placeholder="0"
                  className="h-11 rounded-[8px] border-[#D9DBE3]"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#344054]">
                  Number of Floors
                </label>
                <Input
                  type="number"
                  min="0"
                  value={form.numberOfFloors}
                  onChange={event =>
                    setForm(current => ({
                      ...current,
                      numberOfFloors: event.target.value,
                    }))
                  }
                  placeholder="0"
                  className="h-11 rounded-[8px] border-[#D9DBE3]"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#344054]">
                  Number of Units/Suites
                </label>
                <Input
                  type="number"
                  min="0"
                  value={form.numberOfUnitsSuites}
                  onChange={event =>
                    setForm(current => ({
                      ...current,
                      numberOfUnitsSuites: event.target.value,
                    }))
                  }
                  placeholder="0"
                  className="h-11 rounded-[8px] border-[#D9DBE3]"
                />
              </div>
            </div>
          ) : null}
        </section>

        <section className={cardClassName}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-[#111827]">Unit Details</h2>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={addUnitRow}
              className="h-10 rounded-[8px] border-[#D9DBE3] bg-white px-4 text-sm text-[#475467]"
            >
              Add Unit
            </Button>
          </div>

          <div className="mt-5 space-y-3">
            <div className="hidden grid-cols-[1.2fr_1fr_1fr_56px] gap-4 px-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3] md:grid">
              <span>Unit Type</span>
              <span>Sq Ft</span>
              <span>Base rent</span>
              <span />
            </div>

            {form.unitDetails.map((item, index) => (
              <div
                key={`${index}-${item.unitType}`}
                className="grid gap-3 rounded-[10px] border border-[#EEF2F6] p-3 md:grid-cols-[1.2fr_1fr_1fr_56px] md:items-end"
              >
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#344054] md:hidden">
                    Unit Type
                  </label>
                  <SearchableSelect
                    value={item.unitType}
                    onChange={value =>
                      updateUnitDetail(index, 'unitType', value)
                    }
                    options={[
                      { label: 'Select unit type', value: '' },
                      ...UNIT_TYPE_OPTIONS.map(option => ({
                        label: option,
                        value: option,
                      })),
                    ]}
                    placeholder="Select unit type"
                    searchPlaceholder="Search unit type..."
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#344054] md:hidden">
                    Sq Ft
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={item.sqFt}
                    onChange={event =>
                      updateUnitDetail(index, 'sqFt', event.target.value)
                    }
                    placeholder="0"
                    className="h-11 rounded-[8px] border-[#D9DBE3]"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#344054] md:hidden">
                    Base rent
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={item.baseRent}
                    onChange={event =>
                      updateUnitDetail(index, 'baseRent', event.target.value)
                    }
                    placeholder="0"
                    className="h-11 rounded-[8px] border-[#D9DBE3]"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  onClick={() => removeUnitRow(index)}
                  disabled={form.unitDetails.length === 1}
                  className="h-11 w-11 rounded-[8px] border-[#F1D6D6] text-[#B42318]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {!isSaleMode ? (
          <section className={cardClassName}>
            <h2 className="text-2xl font-bold text-[#111827]">Rental Terms*</h2>
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-sm font-semibold text-[#344054]">
                  Lease Term(Select all that apply)
                </p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                  {[
                    ['Month to Month', 'leaseMonthToMonth'],
                    ['6 months', 'leaseSixMonths'],
                    ['12 months', 'leaseTwelveMonths'],
                    ['Other', 'leaseOther'],
                  ].map(([label, key]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-sm text-[#344054]"
                    >
                      <Checkbox
                        checked={form[key as keyof FormState] as boolean}
                        onCheckedChange={checked =>
                          setForm(current => ({
                            ...current,
                            [key]: Boolean(checked),
                          }))
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>

                {form.leaseOther ? (
                  <div className="mt-3 max-w-sm">
                    <Input
                      value={form.leaseOtherText}
                      onChange={event =>
                        setForm(current => ({
                          ...current,
                          leaseOtherText: event.target.value,
                        }))
                      }
                      placeholder="Custom lease term"
                      className="h-11 rounded-[8px] border-[#D9DBE3]"
                    />
                  </div>
                ) : null}
              </div>

              <div>
                <p className="text-sm font-semibold text-[#344054]">Additional</p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
                  {[
                    ['Utilities Included', 'utilitiesIncluded'],
                    ['Furnished', 'furnished'],
                    ['Pet Friendly', 'petFriendly'],
                  ].map(([label, key]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-sm text-[#344054]"
                    >
                      <Checkbox
                        checked={form[key as keyof FormState] as boolean}
                        onCheckedChange={checked =>
                          setForm(current => ({
                            ...current,
                            [key]: Boolean(checked),
                          }))
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className={cardClassName}>
          <h2 className="text-2xl font-bold text-[#111827]">Amenities</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {AMENITY_OPTIONS.map(option => (
              <label
                key={option}
                className="flex items-center gap-2 text-sm text-[#344054]"
              >
                <Checkbox
                  checked={form.amenities.includes(option)}
                  onCheckedChange={checked =>
                    updateAmenity(option, Boolean(checked))
                  }
                />
                {option}
              </label>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="grid gap-2 md:col-span-3">
              <label className="text-sm font-semibold text-[#344054]">
                Parking Type
              </label>
              <SearchableSelect
                value={form.parkingType}
                onChange={value =>
                  setForm(current => ({ ...current, parkingType: value }))
                }
                options={PARKING_OPTIONS}
                placeholder="Select parking type"
                searchPlaceholder="Search..."
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#344054]">
                HOA Fees (monthly)
              </label>
              <Input
                type="number"
                min="0"
                value={form.hoaFeesMonthly}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    hoaFeesMonthly: event.target.value,
                  }))
                }
                placeholder="000"
                className="h-11 rounded-[8px] border-[#D9DBE3]"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-[#344054]">
                Property Tax (Annual)
              </label>
              <Input
                type="number"
                min="0"
                value={form.propertyTaxAnnual}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    propertyTaxAnnual: event.target.value,
                  }))
                }
                placeholder="000"
                className="h-11 rounded-[8px] border-[#D9DBE3]"
              />
            </div>
          </div>
        </section>

        <section className={cardClassName}>
          <h2 className="text-2xl font-bold text-[#111827]">Photos*</h2>
          <p className="mt-2 text-xs text-[#667085]">
            The first image will be primary photo shown in listings.
          </p>

          <label className="mt-4 flex min-h-[112px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-[#C9D3DF] bg-[#FCFDFE] px-4 text-center">
            <Upload className="h-5 w-5 text-[#667085]" />
            <span className="mt-3 text-sm font-semibold text-[#475467]">
              Upload Photos
            </span>
            <span className="mt-1 text-xs text-[#98A2B3]">
              JPG, PNG, WEBP, or MP4 supported
            </span>
            <input
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              multiple
              className="hidden"
              onChange={event => {
                const files = Array.from(event.target.files || [])
                if (!files.length) return
                setSelectedFiles(current => [...current, ...files].slice(0, 10))
                event.target.value = ''
              }}
            />
          </label>

          {existingPhotoUrls.length ? (
            <div className="mt-4">
              <p className="mb-3 text-sm font-semibold text-[#344054]">
                Existing Photos
              </p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {existingPhotoUrls.map((photoUrl, index) => (
                  <div
                    key={`${photoUrl}-${index}`}
                    className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white"
                  >
                    <Image
                      src={photoUrl}
                      alt={`Existing property photo ${index + 1}`}
                      className="h-40 w-full object-cover"
                      width={640}
                      height={320}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {photoPreviewUrls.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {photoPreviewUrls.map((previewUrl, index) => {
                const file = selectedFiles[index]
                const isVideo = file?.type.startsWith('video/')

                return (
                  <div
                    key={`${previewUrl}-${index}`}
                    className="relative overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white"
                  >
                    {isVideo ? (
                      <video
                        src={previewUrl}
                        className="h-40 w-full object-cover"
                        controls
                      />
                    ) : (
                      <Image
                        src={previewUrl}
                        alt={file?.name || 'Selected upload'}
                        className="h-40 w-full object-cover"
                        width={640}
                        height={320}
                        unoptimized
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="border-t border-[#EEF2F6] px-3 py-2 text-xs text-[#667085]">
                      {file?.name}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </section>

        <div className="flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.push(dashboardBaseRoute)}
            className="h-11 rounded-[8px] border-[#D9DBE3] bg-white px-6 text-sm font-medium text-[#475467]"
          >
            Cancel
          </Button>
          <button
            type="button"
            onClick={() => createListingMutation.mutate()}
            disabled={createListingMutation.isPending}
            className="inline-flex h-11 items-center justify-center rounded-[8px] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background:
                'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
            }}
          >
            {createListingMutation.isPending
              ? isEditMode
                ? 'Saving Changes...'
                : 'Creating Listing...'
              : isEditMode
                ? 'Save Changes'
                : isSaleMode
                  ? 'Create Sale Listing'
                  : 'Create Rental Listing'}
          </button>
        </div>
        </div>
      </div>
    </main>
  )
}

export default function ListPropertyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F8FA]" />}>
      <ListPropertyPageContent />
    </Suspense>
  )
}
