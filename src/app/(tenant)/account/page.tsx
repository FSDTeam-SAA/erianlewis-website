import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import AccountContainer from "./_components/account-container"
import { createMetadata } from "@/lib/seo"
import { authOptions } from "@/lib/auth-options"

export const metadata: Metadata = createMetadata({
  title: "My Account",
  description: "Manage your Alora profile, preferences, and account details.",
  path: "/account",
  noIndex: true,
})
export const dynamic = "force-dynamic"

const AccountPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/sign-in?callbackUrl=%2Faccount")
  }

  return (
    <div>
      <AccountContainer />
    </div>
  )
}

export default AccountPage

