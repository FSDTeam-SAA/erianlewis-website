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

const inputClassName = "h-10 border-[#e5e7eb] bg-white text-sm"

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
    <div className="rounded-lg border border-[#ececf1] p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#111827]">Personal Information</h3>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your first name"
                      className={inputClassName}
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
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your last name"
                      className={inputClassName}
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your phone number"
                      className={inputClassName}
                      disabled={isProfileLoading || isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Current Email</FormLabel>
              <FormControl>
                <Input value={profile?.email ?? ""} className={inputClassName} disabled />
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
