import type { Metadata } from "next"

import { createMetadata } from "@/lib/seo"
import ContactSupportContent from "./contact-support-content"

export const metadata: Metadata = createMetadata({
  title: "Contact Support",
  description:
    "Get help with your Alora account, listings, and platform support.",
  path: "/support/contact",
  keywords: ["contact Alora", "property platform support"],
})

export default function ContactSupportPage() {
  return <ContactSupportContent />
}
