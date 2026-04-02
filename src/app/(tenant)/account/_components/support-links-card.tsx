import Link from "next/link"

import { AccountShellCard } from "./account-shell-card"

const supportLinks = [
  { label: "Contact Support", href: "/support/contact" },
  { label: "Terms of service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
]

export const SupportLinksCard = () => {
  return (
    <AccountShellCard title="Support">
      <div className="divide-y divide-[#ececf1]">
        {supportLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="block px-4 py-3 text-sm font-medium text-[#1f2937] transition-colors hover:bg-[#fafafa]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </AccountShellCard>
  )
}
