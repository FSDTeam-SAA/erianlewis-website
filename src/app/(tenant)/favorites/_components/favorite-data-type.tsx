export interface FavoritesApiResponse {
  status: boolean
  message: string
  data: Favorite[]
}

export interface Favorite {
  _id: string
  user: string
  property: Property
  createdAt: string
  updatedAt: string
  __v: number
}

export interface Property {
  _id: string
  createdByRole: string | null
  basicInformation?: BasicInformation
  address?: Address
  location?: Location
  propertyDetails?: PropertyDetails
  rentalTerms?: RentalTerms
  amenities?: Amenities
  propertyFeatures?: PropertyFeatures
  utilitiesInfrastructure?: UtilitiesInfrastructure
  propertyTaxAnnual?: number
  unitDetails?: UnitDetail[]
  photos?: Photo[]
  createdBy?: CreatedBy
  listingType?: string
  status?: string
  views?: number
  createdAt?: string
  updatedAt?: string
  __v?: number
}

export interface BasicInformation {
  propertyTitle?: string
  details?: string
  propertyType?: {
    _id: string
    name: string
  }
  monthlyRent?: number
  preferredCurrency?: string
}

export interface Address {
  streetNumber?: string
  cityTown?: string
  island?: string | null
}

export interface Location {
  geo: {
    type: string
    coordinates: number[]
  }
  lat: number
  lng: number
}

export interface PropertyDetails {
  bedrooms: number
  bathrooms: number
  squareFeet: number
  lotSizeSqFt: number
  yearBuilt: number
  parkingSpaces: number
  commercialPropertyType: string
  totalBuildingSizeSqFt: number
  numberOfFloors: number
  numberOfUnitsSuites: number
}

export interface RentalTerms {
  leaseTerm: {
    monthToMonth: boolean
    sixMonths: boolean
    twelveMonths: boolean
    other: boolean
    otherText: string
  }
  additional: {
    utilitiesIncluded: boolean
    furnished: boolean
    petFriendly: boolean
  }
}

export interface Amenities {
  amenities: string[]
  parkingType: string
  hoaFeesMonthly: number
  propertyTaxAmount: number
}

export interface PropertyFeatures {
  parkingAvailability: string
  numberOfParkingSpaces: number
  elevator: boolean
  loadingDock: boolean
  accessibilityFeatures: string[]
  securityFeatures: string[]
}

export interface UtilitiesInfrastructure {
  electricityAvailability: boolean
  waterAvailability: boolean
  sewerOrSeptic: boolean
  internetAvailability: boolean
  backupPower: boolean
}

export interface UnitDetail {
  unitType: string
  sqFt: number
  baseRent: number
}

export interface Photo {
  url: string
  publicId: string
  originalName: string
}

export interface CreatedBy {
  _id: string
  firstName: string
  lastName: string
  email: string
}
