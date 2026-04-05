"use client"

import Link from "next/link"
import { useState } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, CreditCard, Eye, EyeOff, Shield, Trash2 } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { toast } from "sonner"

import { Skeleton } from "@/components/ui/skeleton"
import { LogoutConfirmDialog } from "@/components/shared/LogoutConfirmDialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChangeEmailSection } from "@/app/(tenant)/account/_components/change-email-section"
import { ChangePasswordSection } from "@/app/(tenant)/account/_components/change-password-section"
import ProfilePicture from "@/app/(tenant)/account/_components/profile-picture"
import { USER_ME_QUERY_KEY } from "@/app/(tenant)/account/_components/profile-settings-card"
import {
  ApiSuccessResponse,
  SubscriptionPlan,
  UserProfileApiResponse,
} from "@/app/(tenant)/account/_components/user-data-type"
import { AccountGradientButton } from "@/app/(tenant)/account/_components/account-gradient-button"

const supportLinks = [
  { label: "Contact Support", href: "/support/contact" },
  { label: "Terms of service", href: "/support/terms" },
  { label: "Privacy Policy", href: "/support/privacy" },
]

const cardClassName =
  "rounded-[12px] border border-[#E5E7EB] bg-white shadow-[0_4px_12px_rgba(16,24,40,0.08)]"

type PlansApiResponse = {
  status: boolean
  message: string
  data: {
    items: Array<SubscriptionPlan & { targetRoles?: string[]; status?: string }>
  }
}

const formatPlanName = (plan?: Partial<SubscriptionPlan> | null) => {
  if (!plan) return "Free Plan"

  const rawName = plan.title?.trim() || plan.name?.trim() || "Plan"
  return rawName
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, character => character.toUpperCase())
}

const formatPlanPrice = (plan?: Partial<SubscriptionPlan> | null) => {
  if (!plan || !plan.price || plan.billingCycle === "free") {
    return "Free"
  }

  return `$${plan.price}/${plan.billingCycle}`
}

const formatPlanLimit = (plan?: Partial<SubscriptionPlan> | null) => {
  if (!plan) return "Up to 3 properties"
  if (plan.maxProperties === null) return "Unlimited properties"
  return `Up to ${plan.maxProperties} properties`
}

const getOwnerRoleLabel = (role?: string) => {
  if (role === "AGENT") return "agent"
  return "landlord"
}

export default function DashboardSettingsContent() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken
  const queryClient = useQueryClient()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [showDeletePassword, setShowDeletePassword] = useState(false)

  const { data, isLoading } = useQuery<UserProfileApiResponse>({
    queryKey: USER_ME_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Failed to load profile")
      }

      return response.json()
    },
    enabled: Boolean(token),
  })

  const profile = data?.data
  const signedInEmail = profile?.email || session?.user?.email || "example@gmail.com"
  const currentPlan =
    profile?.subscription?.planId && typeof profile.subscription.planId === "object"
      ? profile.subscription.planId
      : null

  const plansQuery = useQuery<PlansApiResponse>({
    queryKey: ["dashboard-subscription-plans", profile?.role],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/plans?status=active&role=${profile?.role || "LANDLORD"}`,
        {
          cache: "no-store",
        },
      )

      if (!response.ok) {
        throw new Error("Failed to load plans")
      }

      return response.json()
    },
    enabled: Boolean(profile?.role && profile.role !== "USER"),
  })

  const signOutAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result: ApiSuccessResponse = await response.json()

      if (!response.ok || !result.status) {
        throw new Error(result.message || "Failed to sign out all devices")
      }

      return result
    },
    onSuccess: async result => {
      toast.success(result.message || "Signed out all devices")
      await signOut({ callbackUrl: "/" })
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : "Failed to sign out all devices")
    },
  })

  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!token) {
        throw new Error("You need to sign in again to continue.")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/subscription/buy/${planId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const result = await response.json()

      if (!response.ok || !result?.status) {
        throw new Error(result?.message || "Failed to start checkout")
      }

      return result.data as { url?: string }
    },
    onSuccess: data => {
      if (data.url) {
        window.location.href = data.url
        return
      }

      toast.error("Stripe checkout URL was not returned.")
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : "Failed to start checkout")
    },
  })

  const handleSignOut = async () => {
    try {
      toast.success("Logout successful!")
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Logout failed:", error)
      toast.error("Logout failed. Please try again.")
    }
  }

  const handleSignOutAllDevices = () => {
    if (!token) {
      toast.error("You need to sign in again to continue.")
      return
    }

    signOutAllMutation.mutate()
  }

  const handleDeleteAccount = () => {
    if (!deletePassword.trim()) {
      toast.error("Please enter your password to continue.")
      return
    }

    toast.message("Delete account flow is not connected.")
  }

  const invalidateProfile = async () => {
    await queryClient.invalidateQueries({ queryKey: USER_ME_QUERY_KEY })
  }

  const availablePlans = (plansQuery.data?.data?.items || []).slice().sort((first, second) => {
    const firstLimit = first.maxProperties ?? Number.POSITIVE_INFINITY
    const secondLimit = second.maxProperties ?? Number.POSITIVE_INFINITY
    return firstLimit - secondLimit
  })

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F7F8FA]">
        <div className="border-b border-[#E5E7EB] bg-white">
          <div className="container flex items-center justify-between py-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-36 rounded-[8px]" />
              <Skeleton className="h-4 w-48 rounded-[8px]" />
            </div>
            <Skeleton className="h-9 w-20 rounded-[8px]" />
          </div>
        </div>

        <div className="container space-y-6 py-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-24 rounded-[8px]" />
            <Skeleton className="h-4 w-56 rounded-[8px]" />
          </div>
          <div className={`${cardClassName} p-4`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36 rounded-[8px]" />
                  <Skeleton className="h-4 w-44 rounded-[8px]" />
                  <Skeleton className="h-4 w-24 rounded-[8px]" />
                </div>
              </div>
              <Skeleton className="h-10 w-28 rounded-[8px]" />
            </div>
          </div>
          <div className={`${cardClassName} p-4`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-10 w-28 rounded-[8px]" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28 rounded-[8px]" />
                <Skeleton className="h-10 w-28 rounded-[8px]" />
              </div>
            </div>
          </div>
          <div className={`${cardClassName} p-4`}>
            <div className="space-y-3">
              <Skeleton className="h-6 w-36 rounded-[8px]" />
              <Skeleton className="h-20 w-full rounded-[12px]" />
              <div className="grid gap-4 lg:grid-cols-3">
                <Skeleton className="h-32 w-full rounded-[12px]" />
                <Skeleton className="h-32 w-full rounded-[12px]" />
                <Skeleton className="h-32 w-full rounded-[12px]" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-6 w-24 rounded-[8px]" />
            <Skeleton className="h-4 w-40 rounded-[8px]" />
          </div>
          <div className={`${cardClassName} grid gap-5 p-4 lg:grid-cols-2`}>
            <div className="space-y-3">
              <Skeleton className="h-6 w-40 rounded-[8px]" />
              <Skeleton className="h-10 w-full rounded-[8px]" />
              <Skeleton className="h-10 w-full rounded-[8px]" />
              <Skeleton className="h-10 w-full rounded-[8px]" />
              <Skeleton className="h-10 w-full rounded-[8px]" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-32 rounded-[8px]" />
              <Skeleton className="h-10 w-full rounded-[8px]" />
              <Skeleton className="h-10 w-full rounded-[8px]" />
              <Skeleton className="h-10 w-36 rounded-[8px]" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA]">
      <div className="border-b border-[#E5E7EB] bg-white">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold leading-normal text-black md:text-[28px]">
              Settings
            </h1>
            <p className="text-sm font-normal leading-normal text-[#262626] md:text-base">
              Manage your account settings
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-black"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="container space-y-8 py-6">
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold leading-normal text-black">Account</h2>
            <p className="text-sm font-normal leading-normal text-[#262626]">
              Signed in as <span className="font-bold">{signedInEmail}</span>
            </p>
          </div>

          <div className={`${cardClassName} p-4`}>
            <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-stretch">
              <ProfilePicture
                profile={profile}
                token={token}
                onProfileUpdated={invalidateProfile}
              />

              <div className="flex flex-col justify-between rounded-[12px] border border-[#EEF2F6] bg-[#FAFBFC] p-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#98A2B3]">
                    Profile Overview
                  </p>
                  <h3 className="mt-3 text-2xl font-bold leading-tight text-[#111827]">
                    Keep your {getOwnerRoleLabel(profile?.role)} profile polished and client-ready.
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085]">
                    Update your profile photo, review your account details, and jump quickly to the places you use most often from one clean dashboard section.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">
                        Account Email
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#111827] break-all">
                        {signedInEmail}
                      </p>
                    </div>
                    <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">
                        Account Role
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#111827]">
                        {profile?.role === "AGENT" ? "AGENT" : "LANDLORD"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <AccountGradientButton
                    className="w-full sm:w-auto"
                    onClick={() => setLogoutDialogOpen(true)}
                  >
                    Sign Out
                  </AccountGradientButton>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/dashboard"
                      className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#D9DBE3] bg-white px-4 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
                    >
                      Go to Dashboard
                    </Link>
                    <Link
                      href="/"
                      className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#D9DBE3] bg-white px-4 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
                    >
                      Go to Homepage
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {profile?.role !== "USER" ? (
          <section className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-black" />
                <h2 className="text-xl font-bold leading-normal text-black">Subscription</h2>
              </div>
              <p className="text-sm font-normal leading-normal text-[#262626]">
                Pick or upgrade a plan for your {getOwnerRoleLabel(profile?.role)} account.
              </p>
            </div>

            <div className={`${cardClassName} p-4`}>
              <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">
                      Current plan
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-[#111827]">
                      {formatPlanName(currentPlan)}
                    </h3>
                    <p className="mt-2 text-sm text-[#667085]">
                      {formatPlanLimit(currentPlan)}
                    </p>
                    {profile?.subscription?.endDate ? (
                      <p className="mt-1 text-xs text-[#98A2B3]">
                        Renews until {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(profile.subscription.endDate))}
                      </p>
                    ) : null}
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-[#F6855C]">
                      {formatPlanPrice(currentPlan)}
                    </p>
                  </div>
                </div>
              </div>

              {plansQuery.isLoading ? (
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-40 w-full rounded-[12px]" />
                  ))}
                </div>
              ) : plansQuery.isError ? (
                <div className="mt-4 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-5">
                  <p className="text-sm font-medium text-[#B42318]">
                    Subscription plans could not be loaded right now.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  {availablePlans.map(plan => {
                    const isCurrentPlan =
                      currentPlan?._id === plan._id ||
                      currentPlan?.name === plan.name

                    return (
                      <div
                        key={plan._id}
                        className={`rounded-[12px] border p-4 transition-colors ${
                          isCurrentPlan
                            ? "border-[#84D6A1] bg-[#F7FFF9]"
                            : "border-[#E5E7EB] bg-white"
                        }`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#98A2B3]">
                          {isCurrentPlan ? "Current Plan" : "Available Plan"}
                        </p>
                        <h3 className="mt-3 text-[26px] font-semibold leading-tight text-[#202124]">
                          {formatPlanName(plan)}
                        </h3>
                        <p className="mt-2 text-[28px] font-semibold leading-none text-[#F6855C]">
                          {plan.price === 0 ? "Free" : `$${plan.price}/month`}
                        </p>
                        <p className="mt-3 text-sm text-[#4B5563]">
                          {formatPlanLimit(plan)}
                        </p>

                        <button
                          type="button"
                          disabled={isCurrentPlan || checkoutMutation.isPending}
                          onClick={() => checkoutMutation.mutate(plan._id)}
                          className={`mt-5 inline-flex h-10 w-full items-center justify-center rounded-[8px] px-4 text-sm font-semibold transition-colors ${
                            isCurrentPlan
                              ? "border border-[#D9DBE3] bg-white text-[#98A2B3]"
                              : "text-white"
                          }`}
                          style={
                            isCurrentPlan
                              ? undefined
                              : {
                                  background:
                                    "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)",
                                }
                          }
                        >
                          {isCurrentPlan
                            ? "Current Plan"
                            : checkoutMutation.isPending
                              ? "Opening Stripe..."
                              : "Upgrade Plan"}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="mt-4 rounded-[12px] border border-[#E5E7EB] bg-[#FAFBFC] px-4 py-4">
                <p className="text-sm font-semibold text-[#111827]">Payment</p>
                <p className="mt-1 text-xs text-[#98A2B3]">Stripe opens in a new window.</p>
                <button
                  type="button"
                  disabled={checkoutMutation.isPending || !availablePlans.length}
                  onClick={() => {
                    const targetPlan =
                      availablePlans.find(plan => plan._id !== currentPlan?._id && plan.price > 0) ||
                      availablePlans.find(plan => plan._id !== currentPlan?._id) ||
                      availablePlans[0]

                    if (!targetPlan) {
                      toast.error("No subscription plan is available right now.")
                      return
                    }

                    checkoutMutation.mutate(targetPlan._id)
                  }}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#171717] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  <CreditCard className="size-4" />
                  {checkoutMutation.isPending ? "Opening Stripe..." : "Pay with Stripe"}
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-black" />
              <h2 className="text-xl font-bold leading-normal text-black">Security</h2>
            </div>
            <p className="text-sm font-normal leading-normal text-[#262626]">
              Change password or email.
            </p>
          </div>

          <div className={`${cardClassName} p-4`}>
            <div className="grid gap-6 lg:grid-cols-2">
              <ChangePasswordSection token={token} />
              <ChangeEmailSection
                currentEmail={signedInEmail}
                token={token}
                onEmailUpdated={invalidateProfile}
              />
            </div>

            <button
              type="button"
              onClick={handleSignOutAllDevices}
              disabled={signOutAllMutation.isPending}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signOutAllMutation.isPending ? "Signing out..." : "Sign out all devices"}
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold leading-normal text-black">Support</h2>
          <div className={`${cardClassName} overflow-hidden`}>
            {supportLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium text-[#1C1C1C] transition-colors hover:bg-[#FAFAFA] ${
                  index !== supportLinks.length - 1 ? "border-b border-[#F2F4F7]" : ""
                }`}
              >
                {link.label}
                <span className="text-[#B8C0CC]">›</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4 pb-10">
          <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] p-4 shadow-[0_4px_12px_rgba(16,24,40,0.04)]">
            <h2 className="text-xl font-bold leading-normal text-[#7F1D1D]">Account</h2>
            <p className="text-sm font-normal leading-normal text-[#BB1C1C]">
              Deleting your account is permanent.
            </p>
          </div>

          <div className={`${cardClassName} p-4`}>
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#E53935] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#D32F2F]"
            >
              <Trash2 className="size-4" />
              Delete Account
            </button>
            <p className="mt-2 text-sm font-normal leading-normal text-[#262626]">
              You&apos;ll need to enter your password to confirm.
            </p>
          </div>
        </section>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-[560px] rounded-[12px] border border-[#E5E7EB] bg-white p-0" showCloseButton={false}>
          <div className="p-5">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-[#111827]">
                Delete your account?
              </DialogTitle>
              <DialogDescription className="text-sm text-[#4B5563]">
                This will permanently delete your profile, listings, and saved data.
                This cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-semibold text-[#374151]">Password</label>
              <div className="relative">
                <input
                  type={showDeletePassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={event => setDeletePassword(event.target.value)}
                  placeholder="password"
                  className="h-11 w-full rounded-[8px] border border-[#E5E7EB] px-4 pr-14 text-sm text-[#111827] outline-none transition-colors focus:border-[#F58A63]"
                  disabled={false}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] transition-colors hover:text-[#111827]"
                  onClick={() => setShowDeletePassword(current => !current)}
                  disabled={false}
                >
                  {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#F1F5F9] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-start">
            <button
              type="button"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletePassword("")
              }}
              className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#D9DBE3] px-4 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
              disabled={false}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#E53935] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#D32F2F] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!deletePassword.trim()}
            >
              Yes, delete account
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleSignOut}
      />
    </main>
  )
}
