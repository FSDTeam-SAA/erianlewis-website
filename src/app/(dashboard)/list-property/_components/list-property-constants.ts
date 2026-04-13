import { type SearchableSelectOption } from '@/components/shared/SearchableSelect'
import { DEFAULT_CURRENCY } from '@/lib/currency'

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

export { CURRENCY_OPTIONS } from '@/lib/currency'

export const UNIT_TYPE_OPTIONS = [
  'Studio',
  'Loft',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  'Penthouse',
]

export const LAND_TYPE_OPTIONS: SearchableSelectOption[] = [
  { label: 'Select land type', value: '' },
  { label: 'Residential', value: 'Residential' },
  { label: 'Commercial', value: 'Commercial' },
  { label: 'Agricultural', value: 'Agricultural' },
  { label: 'Mixed Use', value: 'Mixed Use' },
]

export const LAND_SIZE_UNIT_OPTIONS: SearchableSelectOption[] = [
  { label: 'Select unit', value: '' },
  { label: 'Acres', value: 'Acres' },
  { label: 'Square Meters', value: 'Square Meters' },
]

export const TOPOGRAPHY_OPTIONS: SearchableSelectOption[] = [
  { label: 'Select topography', value: '' },
  { label: 'Flat', value: 'Flat' },
  { label: 'Sloped', value: 'Sloped' },
  { label: 'Mixed', value: 'Mixed' },
]

export const COMMERCIAL_PROPERTY_TYPE_OPTIONS: SearchableSelectOption[] = [
  { label: 'Select property type', value: '' },
  { label: 'Office Building', value: 'Office Building' },
  { label: 'Retail Space', value: 'Retail Space' },
  { label: 'Warehouse', value: 'Warehouse' },
  { label: 'Mixed Use', value: 'Mixed Use' },
  { label: 'Industrial', value: 'Industrial' },
]

export const OCCUPANCY_STATUS_OPTIONS: SearchableSelectOption[] = [
  { label: 'Select occupancy status', value: '' },
  { label: 'Occupied', value: 'Occupied' },
  { label: 'Vacant', value: 'Vacant' },
  { label: 'Partially Occupied', value: 'Partially Occupied' },
]

export const PARKING_AVAILABILITY_OPTIONS: SearchableSelectOption[] = [
  { label: 'Select parking availability', value: '' },
  { label: 'Available', value: 'Available' },
  { label: 'Limited', value: 'Limited' },
  { label: 'Not Available', value: 'Not Available' },
]

export const ACCESSIBILITY_FEATURE_OPTIONS = [
  'Wheelchair accessible entrance',
  'Wheelchair accessible parking',
  'Elevator with braille',
  'Accessible restrooms',
  'Automatic doors',
  'Ramps',
  'Wide doorways',
  'Accessible signage',
]

export const SECURITY_FEATURE_OPTIONS = [
  '24/7 security personnel',
  'CCTV surveillance',
  'Access control system',
  'Security alarm',
  'Fire alarm system',
  'Sprinkler system',
  'Emergency exits',
  'Secure entry',
  'Gated access',
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
  preferredCurrency: DEFAULT_CURRENCY,
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
  landType: '',
  totalLandSize: '',
  landSizeUnit: '',
  topography: '',
  occupancyStatus: '',
  rentalIncome: '',
  operatingExpenses: '',
  parkingAvailability: '',
  numberOfParkingSpaces: '',
  elevator: false,
  loadingDock: false,
  accessibilityFeatures: [],
  securityFeatures: [],
  roadAccess: false,
  electricityAvailability: false,
  waterAvailability: false,
  sewerAvailable: false,
  internetAvailability: false,
  backupPower: false,
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
