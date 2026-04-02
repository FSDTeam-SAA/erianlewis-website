export interface UserProfileApiResponse {
  status: boolean
  message: string
  data: UserProfile
}

export interface ApiSuccessResponse<T = null> {
  status: boolean
  message: string
  data: T
}

export interface UserProfile {
  _id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  dob: string | null
  gender: "male" | "female" | "other"
  role: "USER" | "ADMIN" | string
  entityType: string | null
//   individual: any | null;
//   business: any | null;
  accountStatus: "active" | "inactive" | string
  stripeSessionId: string | null
  hasActiveSubscription: boolean
  subscriptionExpireDate: string | null
  bio: string
  profileImage: string
  multiProfileImage: string[]
  pdfFile: string
  isVerified: boolean
  blockedUsers: string[]
  language: string
  createdAt: string
  updatedAt: string

  subscription: Subscription
  searchUsage: SearchUsage
  address: Address
}

export interface Subscription {
  planId: string | null
  startDate: string | null
  endDate: string | null
}

export interface SearchUsage {
  used: number
  resetDate: string | null
}

export interface Address {
  country: string
  cityState: string
  roadArea: string
  postalCode: string
  taxId: string
}
