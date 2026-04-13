'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  MapPin,
  Share2,
  TriangleAlert,
} from 'lucide-react'
import { toast } from 'sonner'
import { Footer } from '@/components/shared/Footer'
import { PropertyGallery } from '@/components/shared/PropertyGallery'
import { PropertySpecGrid } from '@/components/shared/PropertySpecGrid'
import { ContactLandlordForm } from '@/components/shared/ContactLandlordForm'
import { ScheduleViewingModal } from '@/components/shared/ScheduleViewingModal'
import { ReviewSection } from '@/components/shared/ReviewSection'
import { AmenityTag } from '@/components/shared/AmenityTag'
import {
  formatConvertedPrice,
  getCurrencyLabel,
} from '@/lib/currency'
import { useCurrencyPreference } from '@/lib/hooks/useCurrencyPreference'

type ListingType = 'rent' | 'buy'

interface PropertyDetailsPageProps {
  listingType: ListingType
}

interface LeaseTerm {
  monthToMonth?: boolean
  sixMonths?: boolean
  twelveMonths?: boolean
  other?: boolean
  otherText?: string
}

interface PropertyDetailsResponse {
  _id: string
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
    island?: { name?: string } | string | null
  }
  location?: {
    address?: string
    lat?: number | null
    lng?: number | null
  }
  propertyDetails?: {
    bedrooms?: number
    bathrooms?: number
    squareFeet?: number
    lotSizeSqFt?: number
    parkingSpaces?: number
    yearBuilt?: number
    commercialPropertyType?: string
    totalBuildingSizeSqFt?: number
    numberOfFloors?: number
    numberOfUnitsSuites?: number
    landType?: string
    totalLandSize?: number
    landSizeUnit?: string
    topography?: string
  }
  rentalTerms?: {
    leaseTerm?: LeaseTerm
    additional?: {
      utilitiesIncluded?: boolean
      furnished?: boolean
      petFriendly?: boolean
    }
  }
  financials?: {
    occupancyStatus?: string
    rentalIncome?: number
    operatingExpenses?: number
  }
  amenities?: {
    amenities?: string[]
    parkingType?: string
    hoaFeesMonthly?: number
    propertyTaxAmount?: number
  }
  propertyFeatures?: {
    parkingAvailability?: string
    numberOfParkingSpaces?: number
    elevator?: boolean
    loadingDock?: boolean
    accessibilityFeatures?: string[]
    securityFeatures?: string[]
  }
  utilitiesInfrastructure?: {
    roadAccess?: boolean
    electricityAvailability?: boolean
    waterAvailability?: boolean
    sewerAvailable?: boolean
    sewerOrSeptic?: boolean
    internetAvailability?: boolean
    backupPower?: boolean
  }
  propertyTaxAnnual?: number
  unitDetails?: Array<{
    unitType?: string
    sqFt?: number
    baseRent?: number
  }>
  photos?: Array<{ url?: string }>
  createdBy?: {
    _id?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    role?: string
  }
  listingType?: ListingType
  views?: number
}

const formatBoolean = (value?: boolean) => (value ? 'Yes' : 'No')

const getIslandName = (island?: { name?: string } | string | null) =>
  typeof island === 'object' ? island?.name || 'N/A' : island || 'N/A'

const getLeaseTerms = (leaseTerm?: LeaseTerm) => {
  if (!leaseTerm) return 'N/A'
  const values = []
  if (leaseTerm.monthToMonth) values.push('Month to month')
  if (leaseTerm.sixMonths) values.push('6 month')
  if (leaseTerm.twelveMonths) values.push('12 month')
  if (leaseTerm.other && leaseTerm.otherText) values.push(leaseTerm.otherText)
  return values.join(', ') || 'N/A'
}

const getPropertyTypeName = (
  propertyType?: { _id?: string; name?: string } | string,
) => (typeof propertyType === 'string' ? propertyType : propertyType?.name || 'N/A')

const getPropertyTypeKey = (
  propertyType?: { _id?: string; name?: string } | string,
) =>
  getPropertyTypeName(propertyType)
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '')

export function PropertyDetailsPage({ listingType }: PropertyDetailsPageProps) {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const token = session?.user?.accessToken
  const { selectedCurrency, rates } = useCurrencyPreference()

  const propertyQuery = useQuery({
    queryKey: ['rental-property-single', params?.id],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/rental-properties/${params?.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        },
      )

      const payload = await response.json()
      if (!response.ok || !payload?.status) {
        throw new Error(payload?.message || 'Failed to load property details')
      }

      return payload.data as PropertyDetailsResponse
    },
    enabled: Boolean(params?.id),
  })

  const property = propertyQuery.data

  const favoriteQuery = useQuery({
    queryKey: ['favorite-property', params?.id, token],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites/${params?.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        },
      )

      if (response.status === 404) {
        return null
      }

      const payload = await response.json()
      if (!response.ok || !payload?.status) {
        throw new Error(payload?.message || 'Failed to load favorite status')
      }

      return payload.data
    },
    enabled: Boolean(token && params?.id),
  })

  const favoriteMutation = useMutation({
    mutationFn: async (mode: 'add' | 'remove') => {
      if (!token) {
        throw new Error('Please sign in to manage favorites')
      }

      const response = await fetch(
        mode === 'add'
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites`
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites/${params?.id}`,
        {
          method: mode === 'add' ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body:
            mode === 'add'
              ? JSON.stringify({ propertyId: params?.id })
              : undefined,
        },
      )

      const payload = await response.json()
      if (!response.ok || !payload?.status) {
        throw new Error(payload?.message || 'Failed to update favorite')
      }

      return { mode, payload }
    },
    onSuccess: async ({ mode, payload }) => {
      toast.success(
        payload?.message ||
          (mode === 'add'
            ? 'Property added to favorites'
            : 'Property removed from favorites'),
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['favorite-property'] }),
        queryClient.invalidateQueries({ queryKey: ['favorites'] }),
      ])
    },
    onError: error => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update favorite',
      )
    },
  })

  const isFavorite = Boolean(favoriteQuery.data)

  const images = useMemo(
    () =>
      (property?.photos || [])
        .map(photo => photo.url)
        .filter(Boolean) as string[],
    [property?.photos],
  )
  const locationLabel = useMemo(() => {
    if (!property) return 'Location not available'
    return [
      property.address?.streetNumber,
      property.address?.cityTown,
      getIslandName(property.address?.island),
    ]
      .filter(value => value && value !== 'N/A')
      .join(', ') || property.location?.address || 'Location not available'
  }, [property])

  const propertyTypeName = getPropertyTypeName(property?.basicInformation?.propertyType)
  const propertyTypeKey = getPropertyTypeKey(property?.basicInformation?.propertyType)
  const isApartmentPropertyType = propertyTypeKey === 'apartment'
  const isLandPropertyType = propertyTypeKey === 'land'
  const isCommercialPropertyType = propertyTypeKey === 'commercial'
  const landSizeLabel = property?.propertyDetails?.totalLandSize
    ? `${property.propertyDetails.totalLandSize} ${property.propertyDetails.landSizeUnit || ''}`.trim()
    : 'N/A'

  const specs = isLandPropertyType
    ? [
        { label: 'Type', value: propertyTypeName },
        { label: 'Land Type', value: property?.propertyDetails?.landType || 'N/A' },
        { label: 'Land Size', value: landSizeLabel },
        { label: 'Topography', value: property?.propertyDetails?.topography || 'N/A' },
        { label: 'Island', value: getIslandName(property?.address?.island) },
        { label: 'Views', value: property?.views ?? 0 },
      ]
    : isCommercialPropertyType
      ? [
          { label: 'Type', value: propertyTypeName },
          { label: 'Building Size', value: property?.propertyDetails?.totalBuildingSizeSqFt || 0 },
          { label: 'Floors', value: property?.propertyDetails?.numberOfFloors || 0 },
          { label: 'Units/Suites', value: property?.propertyDetails?.numberOfUnitsSuites || 0 },
          { label: 'Parking', value: property?.propertyFeatures?.numberOfParkingSpaces || property?.propertyDetails?.parkingSpaces || 0 },
          { label: 'Island', value: getIslandName(property?.address?.island) },
        ]
      : isApartmentPropertyType
        ? [
            { label: 'Type', value: propertyTypeName },
            { label: 'Units', value: property?.unitDetails?.length || 0 },
            { label: 'Beds', value: property?.propertyDetails?.bedrooms ?? 0 },
            { label: 'Baths', value: property?.propertyDetails?.bathrooms ?? 0 },
            { label: 'Sq Ft', value: property?.propertyDetails?.squareFeet || property?.unitDetails?.[0]?.sqFt || 0 },
            { label: 'Island', value: getIslandName(property?.address?.island) },
          ]
        : [
            { label: 'Beds', value: property?.propertyDetails?.bedrooms ?? 0 },
            { label: 'Baths', value: property?.propertyDetails?.bathrooms ?? 0 },
            {
              label: 'Sq Ft',
              value:
                property?.propertyDetails?.squareFeet ||
                property?.propertyDetails?.lotSizeSqFt ||
                0,
            },
            { label: 'Parking', value: property?.propertyDetails?.parkingSpaces ?? 0 },
            { label: 'Type', value: propertyTypeName },
            { label: 'Island', value: getIslandName(property?.address?.island) },
          ]

  const rentalDetails = listingType === 'rent'
    ? [
        { label: 'Lease Terms', value: getLeaseTerms(property?.rentalTerms?.leaseTerm) },
        { label: 'Utilities Included', value: formatBoolean(property?.rentalTerms?.additional?.utilitiesIncluded) },
        { label: 'Furnished', value: formatBoolean(property?.rentalTerms?.additional?.furnished) },
        { label: 'Pet Friendly', value: formatBoolean(property?.rentalTerms?.additional?.petFriendly) },
      ]
    : []

  const categoryDetails = isLandPropertyType
    ? [
        { label: 'Land Type', value: property?.propertyDetails?.landType || 'N/A' },
        { label: 'Total Land Size', value: landSizeLabel },
        { label: 'Topography', value: property?.propertyDetails?.topography || 'N/A' },
        { label: 'Road Access', value: formatBoolean(property?.utilitiesInfrastructure?.roadAccess) },
        { label: 'Electricity Available', value: formatBoolean(property?.utilitiesInfrastructure?.electricityAvailability) },
        { label: 'Water Available', value: formatBoolean(property?.utilitiesInfrastructure?.waterAvailability) },
        { label: 'Sewer Available', value: formatBoolean(property?.utilitiesInfrastructure?.sewerAvailable || property?.utilitiesInfrastructure?.sewerOrSeptic) },
        { label: 'Internet Available', value: formatBoolean(property?.utilitiesInfrastructure?.internetAvailability) },
      ]
    : isCommercialPropertyType
      ? [
          { label: 'Commercial Property Type', value: property?.propertyDetails?.commercialPropertyType || 'N/A' },
          { label: 'Total Building Size', value: property?.propertyDetails?.totalBuildingSizeSqFt || 0 },
          { label: 'Number of Floors', value: property?.propertyDetails?.numberOfFloors || 0 },
          { label: 'Units/Suites', value: property?.propertyDetails?.numberOfUnitsSuites || 0 },
          { label: 'Occupancy Status', value: property?.financials?.occupancyStatus || 'N/A' },
          {
            label: 'Rental Income',
            value: property?.financials?.rentalIncome
              ? formatConvertedPrice(
                  property.financials.rentalIncome,
                  property.basicInformation?.preferredCurrency,
                  selectedCurrency,
                  rates,
                )
              : 'N/A',
          },
          {
            label: 'Operating Expenses',
            value: property?.financials?.operatingExpenses
              ? formatConvertedPrice(
                  property.financials.operatingExpenses,
                  property.basicInformation?.preferredCurrency,
                  selectedCurrency,
                  rates,
                )
              : 'N/A',
          },
        ]
      : [
          { label: 'Bedrooms', value: property?.propertyDetails?.bedrooms ?? 0 },
          { label: 'Bathrooms', value: property?.propertyDetails?.bathrooms ?? 0 },
          { label: 'Square Feet', value: property?.propertyDetails?.squareFeet || 0 },
          { label: 'Lot Size', value: property?.propertyDetails?.lotSizeSqFt || 0 },
          { label: 'Year Built', value: property?.propertyDetails?.yearBuilt || 'N/A' },
          { label: 'Parking Spaces', value: property?.propertyDetails?.parkingSpaces ?? 0 },
        ]

  const additionalDetails = isLandPropertyType
    ? []
    : [
        { label: 'Parking Type', value: property?.amenities?.parkingType || 'N/A' },
        { label: 'Parking Space', value: property?.propertyDetails?.parkingSpaces ?? 0 },
        { label: 'Parking Availability', value: property?.propertyFeatures?.parkingAvailability || 'N/A' },
        { label: 'Number of Parking Spaces', value: property?.propertyFeatures?.numberOfParkingSpaces ?? 0 },
      ]

  const moreDetails = [
    {
      label: 'Currency Type',
      value: property?.basicInformation?.preferredCurrency
        ? getCurrencyLabel(property.basicInformation.preferredCurrency)
        : 'N/A',
    },
    { label: 'Views', value: property?.views ?? 0 },
    {
      label: 'Year Built',
      value: property?.propertyDetails?.yearBuilt || 'N/A',
    },
    {
      label: 'Property Tax Annual',
      value: property?.propertyTaxAnnual
        ? formatConvertedPrice(
            property.propertyTaxAnnual,
            property.basicInformation?.preferredCurrency,
            selectedCurrency,
            rates,
          )
        : 'N/A',
    },
  ]

  const googleMapEmbed =
    property?.location?.lat != null && property?.location?.lng != null
      ? `https://www.google.com/maps?q=${property.location.lat},${property.location.lng}&z=14&output=embed`
      : `https://www.google.com/maps?q=${encodeURIComponent(locationLabel || 'Bahamas')}&z=12&output=embed`

  const googleMapsLink =
    property?.location?.lat != null && property?.location?.lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${property.location.lat},${property.location.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationLabel || 'Bahamas')}`

  const handleFavoriteToggle = () => {
    if (!token) {
      toast.error('Please sign in to save favorites')
      return
    }

    favoriteMutation.mutate(isFavorite ? 'remove' : 'add')
  }

  if (propertyQuery.isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 font-sans">
        <div className="mx-auto min-h-screen max-w-container bg-white px-5 py-6 shadow-sm md:px-10 lg:px-32">
          <div className="space-y-6">
            <div className="h-8 w-48 animate-pulse rounded bg-[#eef2f6]" />
            <div className="h-[320px] w-full animate-pulse rounded-2xl bg-[#eef2f6]" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <div className="h-8 w-64 animate-pulse rounded bg-[#eef2f6]" />
                <div className="h-20 w-full animate-pulse rounded-2xl bg-[#eef2f6]" />
                <div className="h-48 w-full animate-pulse rounded-2xl bg-[#eef2f6]" />
              </div>
              <div className="h-[420px] animate-pulse rounded-2xl bg-[#eef2f6]" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (propertyQuery.isError || !property) {
    return (
      <main className="min-h-screen bg-gray-50 font-sans">
        <div className="mx-auto flex min-h-screen max-w-container items-center justify-center bg-white px-5 py-6 shadow-sm md:px-10 lg:px-32">
          <div className="rounded-2xl border border-[#f3c7ba] bg-[#fff7f2] px-8 py-10 text-center">
            <TriangleAlert className="mx-auto mb-4 h-10 w-10 text-[#f6855c]" />
            <h1 className="text-2xl font-bold text-black">
              Couldn&apos;t load property
            </h1>
            <p className="mt-2 text-sm text-[#6b7280]">
              {propertyQuery.error instanceof Error
                ? propertyQuery.error.message
                : 'Property details are not available right now.'}
            </p>
            <button
              type="button"
              onClick={() => propertyQuery.refetch()}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#202124] px-5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <div className="min-h-screen w-full bg-white shadow-sm">
        <div className="mx-auto max-w-container px-5 py-4 md:px-10 lg:px-32">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 mb-6 gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-[14px] font-medium leading-normal text-black transition-colors hover:opacity-80"
              >
                <ArrowLeft size={18} /> Back
              </button>
              <Link
                href="/"
                className="flex items-center hover:opacity-90 transition-opacity"
              >
                <Image
                  src="/logo.png"
                  width={90}
                  height={26}
                  alt="Alora"
                  className="object-contain invert brightness-0"
                />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center justify-center gap-1.5 rounded-lg border border-[#e6e6eb] px-3.5 py-2 text-[13px] font-medium text-[#1f2937] shadow-sm transition-colors hover:bg-[#fafafa]">
                <Share2 size={16} className="text-gray-500" /> Share
              </button>
              <button
                type="button"
                onClick={handleFavoriteToggle}
                disabled={favoriteMutation.isPending || favoriteQuery.isLoading}
                className={`flex items-center justify-center gap-1.5 rounded-lg border px-3.5 py-2 text-[13px] font-medium shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  isFavorite
                    ? 'border-[#f7c6b5] bg-[#fff5f4] text-[#f6855c]'
                    : 'border-[#e6e6eb] text-[#1f2937] hover:bg-[#fafafa]'
                }`}
              >
                <Heart
                  size={16}
                  className={isFavorite ? 'fill-[#f6855c] text-[#f6855c]' : 'text-gray-500'}
                />{' '}
                {isFavorite ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          <PropertyGallery images={images} totalCount={images.length} />

          <div className="mt-10 flex flex-col gap-10 lg:flex-row">
            <div className="flex-1 pb-16">
                  <div className="mb-2 flex items-center gap-3">
                <span className="text-[28px] font-extrabold text-gray-900 tracking-tight">
                  {listingType === 'rent' ? 'Starting from ' : ''}
                  {formatConvertedPrice(
                    property.basicInformation?.monthlyRent,
                    property.basicInformation?.preferredCurrency,
                    selectedCurrency,
                    rates,
                  )}
                  {listingType === 'rent' ? (
                    <span className="text-[17px] font-medium text-gray-500">
                      /month
                    </span>
                  ) : null}
                </span>
                <span
                  style={{
                    background:
                      listingType === 'rent'
                        ? 'linear-gradient(102.89deg, #FF7D51 0%, #FF6C69 100%)'
                        : 'linear-gradient(102.89deg, #80BDEA 0%, #4E8BE3 100%)',
                  }}
                  className="text-white text-[12px] px-3 py-1 rounded-full font-bold shadow-sm tracking-wide"
                >
                  {listingType === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
              </div>
              <h1 className="mb-2.5 text-[22px] font-bold leading-normal text-black">
                {property.basicInformation?.propertyTitle || 'Name Of Property'}
              </h1>
              <div className="mb-8 flex items-center gap-1.5 text-[14px] font-medium leading-normal text-[#6b7280]">
                <MapPin size={16} className="text-gray-400" />
                <span>{locationLabel || 'Location not available'}</span>
              </div>

              <PropertySpecGrid specs={specs} />

              <div className="mt-10">
                <h2 className="mb-5 text-[16px] font-bold leading-normal text-black">
                  {listingType === 'rent' ? 'Rental Details' : 'Sale Details'}
                </h2>
                <div className="grid grid-cols-2 gap-x-5 gap-y-6">
                  {(rentalDetails.length ? rentalDetails : [
                    {
                      label: 'Listing Type',
                      value: listingType === 'buy' ? 'For Sale' : 'For Rent',
                    },
                    {
                      label: 'Price',
                      value: formatConvertedPrice(
                        property.basicInformation?.monthlyRent,
                        property.basicInformation?.preferredCurrency,
                        selectedCurrency,
                        rates,
                      ),
                    },
                  ]).map(item => (
                    <div key={item.label}>
                      <p className="text-[12px] font-bold uppercase tracking-wider text-[#9ca3af]">
                        {item.label}
                      </p>
                      <p className="mt-1.5 text-[14px] font-semibold leading-normal text-black">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="my-8 border-gray-100" />

              <div>
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="flex items-center gap-2 text-[16px] font-bold leading-normal text-black">
                    <MapPin size={18} className="text-blue-500" /> Location
                  </h2>
                  <div className="flex gap-3">
                    <a
                      href={googleMapsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-2 text-[12px] font-bold text-blue-600 shadow-sm transition-colors hover:bg-blue-100"
                    >
                      <ExternalLink size={14} /> Open in Google Maps
                    </a>
                    <a
                      href={googleMapsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-2 text-[12px] font-bold text-blue-600 shadow-sm transition-colors hover:bg-blue-100"
                    >
                      <ExternalLink size={14} /> Open in Apple Maps
                    </a>
                  </div>
                </div>
                <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-gray-200/50 bg-gray-100 shadow-inner lg:h-72">
                  <iframe
                    title="Property location"
                    src={googleMapEmbed}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <hr className="my-8 border-gray-100" />

              <div>
                <h2 className="mb-3 text-[16px] font-bold leading-normal text-black">
                  Description
                </h2>
                <p className="text-[14px] font-normal leading-[1.6] text-[#6b7280]">
                  {property.basicInformation?.details ||
                    'No description available.'}
                </p>
              </div>

              <hr className="my-8 border-gray-100" />

              <div>
                <h2 className="mb-5 text-[16px] font-bold leading-normal text-black">
                  {isLandPropertyType
                    ? 'Land Details'
                    : isCommercialPropertyType
                      ? 'Commercial Details'
                      : isApartmentPropertyType
                        ? 'Apartment Details'
                        : 'Property Details'}
                </h2>
                <div className="grid grid-cols-2 gap-x-5 gap-y-6">
                  {categoryDetails.map(item => (
                    <div key={item.label}>
                      <p className="text-[12px] font-bold uppercase tracking-wider text-[#9ca3af]">
                        {item.label}
                      </p>
                      <p className="mt-1.5 text-[14px] font-semibold leading-normal text-black">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {additionalDetails.length ? (
                <>
                  <hr className="my-8 border-gray-100" />

                  <div>
                    <h2 className="mb-5 text-[16px] font-bold leading-normal text-black">
                      Parking Details
                    </h2>
                    <div className="grid grid-cols-2 gap-x-5 gap-y-6">
                      {additionalDetails.map(item => (
                        <div key={item.label}>
                          <p className="text-[12px] font-bold uppercase tracking-wider text-[#9ca3af]">
                            {item.label}
                          </p>
                          <p className="mt-1.5 text-[14px] font-semibold leading-normal text-black">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              <hr className="my-8 border-gray-100" />

              <div>
                <h2 className="mb-5 text-[16px] font-bold leading-normal text-black">
                  More Details
                </h2>
                <div className="grid grid-cols-2 gap-x-5 gap-y-6">
                  {moreDetails.map(item => (
                    <div key={item.label}>
                      <p className="text-[12px] font-bold uppercase tracking-wider text-[#9ca3af]">
                        {item.label}
                      </p>
                      <p className="mt-1.5 text-[14px] font-semibold leading-normal text-black">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {property.propertyFeatures?.accessibilityFeatures?.length ||
              property.propertyFeatures?.securityFeatures?.length ? (
                <>
                  <hr className="my-8 border-gray-100" />
                  <div>
                    <h2 className="mb-5 text-[16px] font-bold leading-normal text-black">
                      Property Features
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#9ca3af]">
                          Accessibility Features
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(
                            property.propertyFeatures?.accessibilityFeatures ||
                            []
                          ).map(feature => (
                            <AmenityTag key={feature} label={feature} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#9ca3af]">
                          Security Features
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(
                            property.propertyFeatures?.securityFeatures || []
                          ).map(feature => (
                            <AmenityTag key={feature} label={feature} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

              {property.unitDetails?.length ? (
                <>
                  <hr className="my-8 border-gray-100" />
                  <div>
                    <h2 className="mb-5 text-[16px] font-bold leading-normal text-black">
                      Unit Details
                    </h2>
                    <div className="space-y-3">
                      {property.unitDetails.map((unit, index) => (
                        <div
                          key={`${unit.unitType}-${index}`}
                          className="grid grid-cols-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                        >
                          <div>
                            <p className="text-[11px] font-bold text-[#9ca3af]">
                              Unit Type
                            </p>
                            <p className="mt-1 text-[14px] font-semibold leading-normal text-black">
                              {unit.unitType || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-[#9ca3af]">
                              Sq Ft
                            </p>
                            <p className="mt-1 text-[14px] font-semibold leading-normal text-black">
                              {unit.sqFt || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-[#9ca3af]">
                              Base Rent
                            </p>
                            <p className="mt-1 text-[14px] font-semibold leading-normal text-black">
                              {formatConvertedPrice(
                                unit.baseRent,
                                property.basicInformation?.preferredCurrency,
                                selectedCurrency,
                                rates,
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              <hr className="my-8 border-gray-100" />

              <div>
                <h2 className="mb-4 text-[16px] font-bold leading-normal text-black">
                  Amenities
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {(property.amenities?.amenities || []).length ? (
                    property.amenities?.amenities?.map(item => (
                      <AmenityTag key={item} label={item} />
                    ))
                  ) : (
                    <p className="text-[14px] font-normal leading-normal text-[#6b7280]">
                      No amenities listed.
                    </p>
                  )}
                </div>
              </div>

              <hr className="my-8 border-gray-100" />

              <ReviewSection propertyId={property._id} />
            </div>

            <div className="w-full shrink-0 lg:w-[440px] border-l border-gray-100 lg:pl-10">
              <ContactLandlordForm
                onScheduleClick={() => setScheduleModalOpen(true)}
                propertyId={property._id}
                ownerEmail={property.createdBy?.email}
                ownerPhone={property.createdBy?.phone}
                propertyTitle={property.basicInformation?.propertyTitle}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <ScheduleViewingModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        propertyId={property._id}
        propertyTitle={property.basicInformation?.propertyTitle}
      />
    </main>
  )
}
