import type { Metadata } from "next"

import { createMetadata } from "@/lib/seo"

export const metadata: Metadata = createMetadata({
  title: "Dashboard",
  description: "Manage listings, appointments, and account activity inside the Alora dashboard.",
  path: "/dashboard",
  noIndex: true,
})

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
