import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { createMetadata } from "@/lib/seo"

export const metadata: Metadata = createMetadata({
  title: "Subscription Payment Cancelled",
  description: "Your Alora subscription checkout was cancelled.",
  path: "/subscription-cancel",
  noIndex: true,
})

export default function SubscriptionCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4 py-12">
      <section className="w-full max-w-xl rounded-[8px] border border-[#E5E7EB] bg-white p-6 text-center shadow-[0_4px_12px_rgba(16,24,40,0.08)] sm:p-8">
        <Image
          src="/logo.png"
          alt="Alora"
          width={92}
          height={92}
          className="mx-auto h-16 w-16 object-contain"
          priority
        />

        <p className="mt-6 text-sm font-semibold uppercase text-[#F6855C]">
          Subscription
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#111827]">
          Payment cancelled
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#667085]">
          Your current plan has not changed. You can return to settings whenever you are ready.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/profile"
            className="inline-flex h-11 items-center justify-center rounded-[8px] bg-[#171717] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Return to settings
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#D9DBE3] bg-white px-5 text-sm font-semibold text-[#374151] transition-colors hover:bg-[#F9FAFB]"
          >
            Go to dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}
