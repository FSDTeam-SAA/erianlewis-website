import Link from "next/link"
import { Headphones, ScrollText, ShieldCheck } from "lucide-react"

const supportLinks = [
  { label: "Contact Support", href: "/support/contact", icon: Headphones },
  { label: "Terms of Service", href: "/support/terms", icon: ScrollText },
  { label: "Privacy Policy", href: "/support/privacy", icon: ShieldCheck },
]

export const SupportLinksCard = () => {
  return (
    <div>
      <h3 className="py-5 text-xl font-bold leading-normal text-black md:py-6 md:text-2xl">Support</h3>
      <div className="overflow-hidden rounded-2xl border border-[#eceef2] bg-white">
        {supportLinks.map(link => {
          const Icon = link.icon

          return (
          <Link
            key={link.label}
            href={link.href}
            className="flex items-center justify-between border-b border-[#f2f4f7] px-4 py-3 text-sm font-semibold text-[#1c1c1c] transition-colors hover:bg-[#fafafa] md:text-base"
          >
            <span className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-[#8b95a7]" />
              {link.label}
            </span>
            <span className="text-[#b8c0cc]">›</span>
          </Link>
          )
        })}
      </div>
    </div>
  )
}
