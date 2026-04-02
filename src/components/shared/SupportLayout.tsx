"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Headphones, ScrollText, ShieldCheck } from "lucide-react"

type SupportTab = "contact" | "terms" | "privacy"

interface SupportLayoutProps {
  children: React.ReactNode
  activeTab: SupportTab
}

const tabItems: Array<{
  href: string
  key: SupportTab
  label: string
  icon: typeof Headphones
}> = [
  {
    href: "/support/contact",
    key: "contact",
    label: "Contact Support",
    icon: Headphones,
  },
  {
    href: "/support/terms",
    key: "terms",
    label: "Terms of Service",
    icon: ScrollText,
  },
  {
    href: "/support/privacy",
    key: "privacy",
    label: "Privacy Policy",
    icon: ShieldCheck,
  },
]

const pageMeta: Record<
  SupportTab,
  {
    eyebrow: string
    title: string
    effectiveDate: string
    desc: string
  }
> = {
  contact: {
    eyebrow: "Support Center",
    title: "Contact Support",
    effectiveDate: "As of July 17, 2024",
    desc : "Need help? Email us and we’ll get back to you"
  },
  terms: {
    eyebrow: "Legal & Policy",
    title: "Terms of Service",
    effectiveDate: "As of July 17, 2024",
    desc : "Effective 1/8/2026"
  },
  privacy: {
    eyebrow: "Legal & Policy",
    title: "Privacy Policy",
    effectiveDate: "As of July 17, 2024",
    desc: "Effective 1/8/2026"
  },
}

export function SupportLayout({ children, activeTab }: SupportLayoutProps) {
  const router = useRouter()
  const meta = pageMeta[activeTab]

  return (
    <main className="min-h-screen bg-[#f3f4f6]">
      <div className="w-full border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-normal text-black">
                  {meta.title}
                </h1>
                <p className="mt-1 text-sm md:text-base font-normal leading-normal text-[#262626]">{meta.desc}</p>
              </div>

              <div className="pt-6">
                <button
                type="button"
                onClick={() => router.push("/account")}
                className="inline-flex items-center gap-1.5 self-start text-xs md:text-sm font-normal leading-normal text-[#525252] transition-colors hover:text-[#111827]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back Settings
              </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pb-2">
              {tabItems.map(item => {
                const isActive = item.key === activeTab
                const Icon = item.icon

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm md:text-base font-medium leading-normal transition-all ${
                      isActive
                        ? "border-transparent text-white shadow-sm"
                        : "border-[#e4e7ec] bg-white text-black hover:border-[#d7dce3] hover:bg-[#f8fafc]"
                    }`}
                    style={
                      isActive
                        ? { background: "linear-gradient(90deg, #8fd3e8 0%, #f28b64 100%)" }
                        : undefined
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-[#fbfbfc]">
        <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6">{children}</div>
      </div>
    </main>
  )
}
