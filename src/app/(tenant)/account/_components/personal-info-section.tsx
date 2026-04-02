"use client"

import { useEffect } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { AccountGradientButton } from "./account-gradient-button"
import ProfilePicture from "./profile-picture"
import { UserProfile, UserProfileApiResponse } from "./user-data-type"



type PersonalInfoSectionProps = {
  profile?: UserProfile
  token?: string
  isProfileLoading: boolean
  onProfileUpdated: () => Promise<void> | void
}

type PersonalInfoFormState = {
  firstName: string
  lastName: string
  phone: string
}

const personalInfoSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
})

const getInitialFormState = (profile?: UserProfile): PersonalInfoFormState => ({
  firstName: profile?.firstName ?? "",
  lastName: profile?.lastName ?? "",
  phone: profile?.phone ?? "",
})

export const PersonalInfoSection = ({
  profile,
  token,
  isProfileLoading,
  onProfileUpdated,
}: PersonalInfoSectionProps) => {
  const form = useForm<PersonalInfoFormState>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: getInitialFormState(profile),
  })

  useEffect(() => {
    form.reset(getInitialFormState(profile))
  }, [form, profile])

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: PersonalInfoFormState) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const result: UserProfileApiResponse = await response.json()

      if (!response.ok || !result.status) {
        throw new Error(result.message || "Failed to update profile")
      }

      return result
    },
    onSuccess: async result => {
      toast.success(result.message || "User profile updated successfully")
      await onProfileUpdated()
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    },
  })

  const handleSubmit = (values: PersonalInfoFormState) => {
    if (!token) {
      toast.error("You need to sign in again to update your profile.")
      return
    }

    mutate({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
    })
  }

  return (
    <div className="bg-white rounded-[16px] shadow-[0px_1px_4px_0px_#00000040] px-6 py-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg md:text-xl lg:text-2xl font-medium leading-normal text-[#1E1E1E]">Personal Information</h3>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base md:text-lg font-medium leading-normal text-[#1E1E1E]">First Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your first name"
                      className="border-[0.5px] border-[#6D6D6D] rounded-[12px] h-[44px] w-full text-base leading-normal font-normal text-[#1E1E1E] px-4 focus:ring-2 focus:ring-[#6D6D6] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isProfileLoading || isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base md:text-lg font-medium leading-normal text-[#1E1E1E]">Last Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your last name"
                      className="border-[0.5px] border-[#6D6D6D] rounded-[12px] h-[44px] w-full text-base leading-normal font-normal text-[#1E1E1E] px-4 focus:ring-2 focus:ring-[#6D6D6] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isProfileLoading || isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base md:text-lg font-medium leading-normal text-[#1E1E1E]">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your phone number"
                      className="border-[0.5px] border-[#6D6D6D] rounded-[12px] h-[44px] w-full text-base leading-normal font-normal text-[#1E1E1E] px-4 focus:ring-2 focus:ring-[#6D6D6] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isProfileLoading || isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel className="text-base md:text-lg font-medium leading-normal text-[#1E1E1E]">Current Email</FormLabel>
              <FormControl>
                <Input value={profile?.email ?? ""} className="border-[0.5px] border-[#6D6D6D] rounded-[12px] h-[44px] w-full text-base leading-normal font-normal text-[#1E1E1E] px-4 focus:ring-2 focus:ring-[#6D6D6] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50" disabled />
              </FormControl>
            </FormItem>
            </div>

            <AccountGradientButton type="submit" className="w-full sm:w-auto" disabled={isProfileLoading || isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </AccountGradientButton>
          </div>

          <div className="md:col-span-1">
            <ProfilePicture profile={profile} token={token} onProfileUpdated={onProfileUpdated} />
          </div>
        </form>
      </Form>
    </div>
  )
}
