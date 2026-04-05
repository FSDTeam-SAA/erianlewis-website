"use client"

import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { AccountGradientButton } from "./account-gradient-button"
import { ApiSuccessResponse } from "./user-data-type"

type ChangeEmailSectionProps = {
  currentEmail: string
  token?: string
  onEmailUpdated?: () => Promise<void> | void
}

const changeEmailSchema = z.object({
  newEmail: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type ChangeEmailValues = z.infer<typeof changeEmailSchema>

export const ChangeEmailSection = ({ currentEmail, token, onEmailUpdated }: ChangeEmailSectionProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
      password: "",
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: ChangeEmailValues) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: values.newEmail.trim(),
        }),
      })

      const result: ApiSuccessResponse = await response.json()

      if (!response.ok || !result.status) {
        throw new Error(result.message || "Failed to update email")
      }

      return result
    },
    onSuccess: async result => {
      toast.success(result.message || "Email updated successfully")
      form.reset()
      await onEmailUpdated?.()
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : "Failed to update email")
    },
  })

  const handleSubmit = (values: ChangeEmailValues) => {
    if (!token) {
      toast.error("You need to sign in again to change your email.")
      return
    }

    if (values.newEmail.trim().toLowerCase() === currentEmail.trim().toLowerCase()) {
      toast.error("Please enter a different email address.")
      return
    }

    mutate(values)
  }

  return (
    <div className="">
      <h3 className="text-lg md:text-xl lg:text-2xl font-medium leading-normal text-[#1E1E1E]">Change Email</h3>
      <p className="text-[#262626] font-normal leading-normal text-sm md:text-base pb-4">You’ll need your password to confirm this change.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormItem>
            <FormLabel className="text-base text-[#2C3E50] font-semibold leading-normal">Current email</FormLabel>
            <FormControl>
              <Input type="email" value={currentEmail} className="border-[0.5px] border-[#D9D9D9] rounded-[4px] h-[40px] w-full text-base leading-normal font-normal text-[#1E1E1E] px-4 focus:ring-2 focus:ring-[#6D6D6] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50" disabled />
            </FormControl>
            <FormDescription>You&apos;ll need your password to confirm this change.</FormDescription>
          </FormItem>

          <FormField
            control={form.control}
            name="newEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base text-[#2C3E50] font-semibold leading-normal">New email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="new-email@gmail.com"
                    className="border-[0.5px] border-[#D9D9D9] rounded-[4px] h-[40px] w-full text-base leading-normal font-normal text-[#1E1E1E] px-4 focus:ring-2 focus:ring-[#6D6D6] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base text-[#2C3E50] font-semibold leading-normal">Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="border-[0.5px] border-[#D9D9D9] rounded-[4px] h-[40px] w-full text-base leading-normal font-normal text-[#1E1E1E] px-4 pr-14 focus:ring-2 focus:ring-[#6D6D6] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isPending}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] transition-colors hover:text-[#111827]"
                    onClick={() => setShowPassword(current => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isPending}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <AccountGradientButton type="submit" className="w-full sm:w-auto" disabled={isPending}>
            {isPending ? "Updating..." : "Update Email"}
          </AccountGradientButton>
        </form>
      </Form>
    </div>
  )
}
