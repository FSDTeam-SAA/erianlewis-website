"use client"

import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import { signOut } from "next-auth/react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
})

type ChangeEmailValues = z.infer<typeof changeEmailSchema>

export const ChangeEmailSection = ({ currentEmail, token, onEmailUpdated }: ChangeEmailSectionProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const form = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
    },
  })

  const newEmailValue = form.watch("newEmail")

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: { newEmail: string; password: string }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: values.newEmail.trim(),
          currentPassword: values.password,
        }),
      })

      const result: ApiSuccessResponse = await response.json()

      if (!response.ok || !result.status) {
        throw new Error(result.message || "Failed to update email")
      }

      return result
    },
    onSuccess: async (_, variables) => {
      toast.success("Email updated successfully. Please sign in again with your new email.")
      form.reset()
      setConfirmPassword("")
      setConfirmationOpen(false)
      await onEmailUpdated?.()
      await signOut({
        callbackUrl: `/sign-in?email=${encodeURIComponent(variables.newEmail.trim())}&emailUpdated=1`,
      })
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : "Failed to update email")
    },
  })

  const handleOpenConfirmation = (values: ChangeEmailValues) => {
    if (!token) {
      toast.error("You need to sign in again to change your email.")
      return
    }

    if (values.newEmail.trim().toLowerCase() === currentEmail.trim().toLowerCase()) {
      toast.error("Please enter a different email address.")
      return
    }

    setConfirmPassword("")
    setShowPassword(false)
    setConfirmationOpen(true)
  }

  const handleConfirmUpdate = () => {
    const nextEmail = newEmailValue.trim()

    if (!token) {
      toast.error("You need to sign in again to change your email.")
      return
    }

    if (!nextEmail) {
      toast.error("Enter your new email address first.")
      return
    }

    if (!confirmPassword.trim()) {
      toast.error("Please enter your password to confirm the email change.")
      return
    }

    mutate({
      newEmail: nextEmail,
      password: confirmPassword,
    })
  }

  return (
    <div className="">
      <h3 className="text-lg md:text-xl lg:text-2xl font-medium leading-normal text-[#1E1E1E]">Change Email</h3>
      <p className="text-[#262626] font-normal leading-normal text-sm md:text-base pb-4">We&apos;ll ask you to confirm the change in a secure modal before updating your sign-in email.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleOpenConfirmation)} className="space-y-3">
          <FormItem>
            <FormLabel className="text-base text-[#2C3E50] font-semibold leading-normal">Current email</FormLabel>
            <FormControl>
              <Input type="email" value={currentEmail} className="border-[0.5px] border-[#D9D9D9] rounded-[4px] h-[40px] w-full text-base leading-normal font-normal text-[#1E1E1E] px-4 focus:ring-2 focus:ring-[#6D6D6] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50" disabled />
            </FormControl>
            <FormDescription>Your current email stays active until you confirm the update.</FormDescription>
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

          <AccountGradientButton type="submit" className="w-full sm:w-auto" disabled={isPending}>
            Review Email Change
          </AccountGradientButton>
        </form>
      </Form>

      <Dialog open={confirmationOpen} onOpenChange={open => !isPending && setConfirmationOpen(open)}>
        <DialogContent className="max-w-[520px] rounded-[20px] border border-[#E5E7EB] bg-white p-0" showCloseButton={!isPending}>
          <div className="px-6 py-6">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-semibold text-[#111827]">Confirm email update</DialogTitle>
              <DialogDescription className="text-sm leading-6 text-[#667085]">
                You&apos;re about to change your sign-in email from <span className="font-semibold text-[#111827]">{currentEmail}</span> to <span className="font-semibold text-[#111827]">{newEmailValue || "your new address"}</span>. Enter your password to continue.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-2">
              <label className="text-sm font-semibold text-[#344054]">Account password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  placeholder="Enter your current password"
                  className="h-11 rounded-[8px] border-[#D9DBE3] pr-12"
                  disabled={isPending}
                />
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
              <p className="text-xs text-[#667085]">For security, we&apos;ll sign you out after the email is updated so you can sign back in with the new address.</p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#EEF2F6] bg-[#FAFBFC] px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setConfirmationOpen(false)
                setConfirmPassword("")
              }}
              disabled={isPending}
              className="rounded-[8px] border-[#D9DBE3] bg-white text-[#475467]"
            >
              Cancel
            </Button>
            <AccountGradientButton
              type="button"
              onClick={handleConfirmUpdate}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? "Updating..." : "Confirm Email Change"}
            </AccountGradientButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
