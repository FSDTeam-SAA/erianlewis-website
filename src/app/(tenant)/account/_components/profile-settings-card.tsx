"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { AccountShellCard } from "./account-shell-card"
import { ChangeEmailSection } from "./change-email-section"
import { ChangePasswordSection } from "./change-password-section"
import { PersonalInfoSection } from "./personal-info-section"
import { UserProfileApiResponse } from "./user-data-type"

export const USER_ME_QUERY_KEY = ["user-me"] as const

export const ProfileSettingsCard = () => {
  const { data: session } = useSession()
  const token = session?.user?.accessToken
  const queryClient = useQueryClient()

  const { data, isLoading, isFetching } = useQuery<UserProfileApiResponse>({
    queryKey: USER_ME_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to load profile")
      }

      return response.json()
    },
    enabled: Boolean(token),
  })

  const profile = data?.data

  return (
    <AccountShellCard
      title="Profile Settings"
      description=""
    >
      <div className="space-y-4 p-4 sm:p-5">
        <PersonalInfoSection
          profile={profile}
          token={token}
          isProfileLoading={isLoading || isFetching}
          onProfileUpdated={async () => {
            await queryClient.invalidateQueries({ queryKey: USER_ME_QUERY_KEY })
          }}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <ChangePasswordSection token={token} />
          <ChangeEmailSection currentEmail={profile?.email ?? ""} />
        </div>
      </div>
    </AccountShellCard>
  )
}
