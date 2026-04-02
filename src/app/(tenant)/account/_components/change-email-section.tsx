"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { AccountGradientButton } from "./account-gradient-button"

type ChangeEmailSectionProps = {
  currentEmail: string
}

const changeEmailSchema = z.object({
  newEmail: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type ChangeEmailValues = z.infer<typeof changeEmailSchema>

export const ChangeEmailSection = ({ currentEmail }: ChangeEmailSectionProps) => {
  const form = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
      password: "",
    },
  })

  const handleSubmit = () => {
    toast.message("Change email endpoint is not connected yet.")
  }

  return (
    <div className="rounded-lg border border-[#ececf1] p-4">
      <h3 className="text-sm font-semibold text-[#111827]">Change Email</h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormItem>
            <FormLabel>Current email</FormLabel>
            <FormControl>
              <Input type="email" value={currentEmail} className="h-9 border-[#e5e7eb] bg-white text-sm" disabled />
            </FormControl>
            <FormDescription>You&apos;ll need your password to confirm this change.</FormDescription>
          </FormItem>

          <FormField
            control={form.control}
            name="newEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="new-email@gmail.com"
                    className="h-9 border-[#e5e7eb] bg-white text-sm"
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Password"
                    className="h-9 border-[#e5e7eb] bg-white text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <AccountGradientButton type="submit" className="w-full sm:w-auto">
            Update Email
          </AccountGradientButton>
        </form>
      </Form>
    </div>
  )
}
