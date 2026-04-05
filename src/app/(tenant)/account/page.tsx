import type { Metadata } from "next"
import AccountContainer from "./_components/account-container"
import { createMetadata } from "@/lib/seo"

export const metadata: Metadata = createMetadata({
  title: "My Account",
  description: "Manage your Alora profile, preferences, and account details.",
  path: "/account",
  noIndex: true,
})
export const dynamic = "force-dynamic"

const AccountPage = () => {
  return (
    <div>
      <AccountContainer />
    </div>
  )
}

export default AccountPage



