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
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Password"
                    className="border-[0.5px] border-[#D9D9D9] rounded-[4px] h-[40px] w-full text-base leading-normal font-normal text-[#1E1E1E] px-4 focus:ring-2 focus:ring-[#6D6D6] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
