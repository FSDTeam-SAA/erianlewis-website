import { type SearchableSelectOption } from '@/components/shared/SearchableSelect'

import type { FormState, UnitDetail } from './list-property-types'

export const AMENITY_OPTIONS = [
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

export const PARKING_OPTIONS: SearchableSelectOption[] = [
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

export const CURRENCY_OPTIONS: SearchableSelectOption[] = [
  { label: 'AED - United Arab Emirates Dirham', value: 'AED' },
  { label: 'AFN - Afghanistan Afghani', value: 'AFN' },
  { label: 'ALL - Albania Lek', value: 'ALL' },
  { label: 'AMD - Armenian Dram', value: 'AMD' },
]

export const UNIT_TYPE_OPTIONS = [
  'Studio',
  'Loft',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  'Penthouse',
]

export const cardClassName =
  'rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_12px_rgba(16,24,40,0.08)]'

export const defaultUnitDetails = (): UnitDetail[] => [
  { unitType: 'Studio', sqFt: '', baseRent: '' },
]

export const defaultFormState = (): FormState => ({
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

export const toNumber = (value: string) => {
  if (!value.trim()) return 0

  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

export const buildGoogleMapsUrl = (lat?: string, lng?: string, query?: string) => {
  if (lat && lng) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=15&output=embed`
  }

  if (query?.trim()) {
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`
  }

  return 'https://www.google.com/maps?q=Caribbean&z=4&output=embed'
}

export const normalizeLocationQuery = (...parts: Array<string | undefined>) =>
  parts
    .map(part => part?.trim())
    .filter(Boolean)
    .join(', ')
    .replace(/\s+/g, ' ')
    .trim()

export const uniqueQueries = (queries: string[]) =>
  Array.from(new Set(queries.map(query => query.trim()).filter(Boolean)))
