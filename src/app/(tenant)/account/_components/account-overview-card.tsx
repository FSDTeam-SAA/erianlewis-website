"use client"

import Link from "next/link"
import { Shield } from "lucide-react"

import { AccountGradientButton } from "./account-gradient-button"
// import { AccountShellCard } from "./account-shell-card"
import { useSession } from "next-auth/react"

export const AccountOverviewCard = () => {
  const session = useSession();
  const userEmail = session?.data?.user?.email || "example@gmail.com"
  return (

    <div className="pt-4">
       <div className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-lg md:text-xl lg:text-2xl leading-normal font-bold text-black">Account</h3>
          <p className="text-sm md:text-base font-normal text-[#262626] leading-normal">Signed in as <span className="font-bold">{userEmail}</span></p>
        </div>

        <div className="bg-white flex flex-col gap-3 rounded-lg border border-[#ececf1] px-3 py-4 sm:flex-row sm:items-center sm:justify-between shadow-[1px_1px_4px_0px_#00000040]">
          <AccountGradientButton className="w-full sm:w-auto">Sign Out</AccountGradientButton>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-[#d9dbe3] px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#f9fafb]"
          >
            Go to Homepage
          </Link>
        </div>

        <div className="space-y-1 text-sm text-[#6b7280]">
          <div className="flex items-center gap-2 text-lg md:text-xl lg:text-2xl font-medium text-black leading-normal">
            <Shield className="size-6 text-black" />
            Security
          </div>
          <p className="text-[#262626] font-normal leading-normal text-sm md:text-base">Change password or email</p>
        </div>
      </div>
    </div>
  )
}
