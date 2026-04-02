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

const plainActionClassName = "text-xs font-medium text-[#374151] transition-colors hover:text-[#111827]"
const passwordInputClassName = "h-9 border-[#e5e7eb] bg-white pr-10 text-sm"

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword"

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match.",
    path: ["confirmPassword"],
  })

type ChangePasswordValues = z.infer<typeof changePasswordSchema>

type ChangePasswordSectionProps = {
  token?: string
}

export const ChangePasswordSection = ({ token }: ChangePasswordSectionProps) => {
  const [showField, setShowField] = useState<Record<PasswordField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: ChangePasswordValues) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      })

      const result: ApiSuccessResponse = await response.json()

      if (!response.ok || !result.status) {
        throw new Error(result.message || "Failed to change password")
      }

      return result
    },
    onSuccess: result => {
      toast.success(result.message || "Password changed successfully")
      form.reset()
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : "Failed to change password")
    },
  })

  const handleSubmit = (values: ChangePasswordValues) => {
    if (!token) {
      toast.error("You need to sign in again to change your password.")
      return
    }

    mutate(values)
  }

  const renderPasswordInput = (fieldName: PasswordField, label: string, placeholder: string, description?: string) => (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <div className="relative">
            <FormControl>
              <Input
                {...field}
                type={showField[fieldName] ? "text" : "password"}
                placeholder={placeholder}
                className={passwordInputClassName}
                disabled={isPending}
              />
            </FormControl>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] transition-colors hover:text-[#111827]"
              onClick={() => setShowField(current => ({ ...current, [fieldName]: !current[fieldName] }))}
              aria-label={showField[fieldName] ? `Hide ${label}` : `Show ${label}`}
              disabled={isPending}
            >
              {showField[fieldName] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <div className="rounded-lg border border-[#ececf1] p-4">
      <h3 className="text-sm font-semibold text-[#111827]">Change Password</h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          {renderPasswordInput("currentPassword", "Current password", "Current password")}
          {renderPasswordInput("newPassword", "New password", "New password", "New password must be at least 8 characters.")}
          {renderPasswordInput("confirmPassword", "Confirm new password", "Confirm new password")}

          <div className="flex flex-col gap-3 pt-1">
            <AccountGradientButton type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Updating..." : "Update Password"}
            </AccountGradientButton>
            <button
              type="button"
              className={plainActionClassName}
              onClick={() => toast.message("Forgot password flow is not connected yet.")}
              disabled={isPending}
            >
              Forgot Password
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}
