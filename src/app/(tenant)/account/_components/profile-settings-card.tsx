"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
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
   <div>
    <h3 className="text-[#1E1E1E] font-medium leading-normal text-xl md:text-2xl lg:text-3xl pt-4 pb-6">Profile Settings</h3>
     <div className="space-y-6">
        <PersonalInfoSection
          profile={profile}
          token={token}
          isProfileLoading={isLoading || isFetching}
          onProfileUpdated={async () => {
            await queryClient.invalidateQueries({ queryKey: USER_ME_QUERY_KEY })
          }}
        />

        <div className="grid gap-4 lg:grid-cols-2 bg-white rounded-[16px] shadow-[0px_1px_4px_0px_#00000040] px-6 py-4 ">
          <ChangePasswordSection token={token} />
          <ChangeEmailSection
            currentEmail={profile?.email ?? ""}
            token={token}
            onEmailUpdated={async () => {
              await queryClient.invalidateQueries({ queryKey: USER_ME_QUERY_KEY })
            }}
          />
        </div>
      </div>
   </div>
  )
}
