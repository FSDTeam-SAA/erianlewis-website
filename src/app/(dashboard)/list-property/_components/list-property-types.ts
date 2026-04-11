export type CategoryOption = {
  _id: string
  name: string
  status?: string
}

export type IslandOption = {
  _id: string
  name: string
}

export type IslandsResponse = {
  status: boolean
  message: string
  data: {
    islands: IslandOption[]
  }
}

export type CategoriesResponse = {
  status: boolean
  message: string
  data: CategoryOption[]
}

export type RentalPropertyResponse = {
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
      landType?: string
      totalLandSize?: number
      landSizeUnit?: string
      topography?: string
    }
    utilitiesInfrastructure?: {
      roadAccess?: boolean
      electricityAvailability?: boolean
      waterAvailability?: boolean
      sewerAvailable?: boolean
      internetAvailability?: boolean
      backupPower?: boolean
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
    propertyTaxAnnual?: number
    propertyFeatures?: {
      parkingAvailability?: string
      numberOfParkingSpaces?: number
      elevator?: boolean
      loadingDock?: boolean
      accessibilityFeatures?: string[]
      securityFeatures?: string[]
    }
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

export type UnitDetail = {
  unitType: string
  sqFt: string
  baseRent: string
}

export type FormState = {
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
  landType: string
  totalLandSize: string
  landSizeUnit: string
  topography: string
  occupancyStatus: string
  rentalIncome: string
  operatingExpenses: string
  parkingAvailability: string
  numberOfParkingSpaces: string
  elevator: boolean
  loadingDock: boolean
  accessibilityFeatures: string[]
  securityFeatures: string[]
  roadAccess: boolean
  electricityAvailability: boolean
  waterAvailability: boolean
  sewerAvailable: boolean
  internetAvailability: boolean
  backupPower: boolean
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
