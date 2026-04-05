"use client"

import { Copy, Mail, Send } from "lucide-react"
import { toast } from "sonner"

import { SupportLayout } from "@/components/shared/SupportLayout"

const supportEmail = "info@alorarrealty.com"

export default function ContactSupportContent() {
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail)
      toast.success("Email address copied")
    } catch {
      toast.error("Could not copy email address")
    }
  }

  return (
    <SupportLayout activeTab="contact">
      <div className="container">
        <div className="">
          <div className=" px-4 py-3">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold leading-normal text-black">Contact</h2>
            <p className="mt-1 text-sm md:text-base font-normal leading-normal text-[#262626]">
              We are here if you need help with your account, listings, or general platform support.
            </p>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className=" bg-white shadow-[1px_1px_4px_0px_#00000040] p-4 rounded-[12px]">
              <p className="text-sm md:text-base font-normal leading-normal text-black">Email</p>

              <a
                href={`mailto:${supportEmail}`}
                className="mt-3 h-[44px] flex w-full items-center justify-between gap-3 rounded-md px-4 py-2.5 text-white shadow-sm transition-opacity hover:opacity-95"
                style={{ background: "linear-gradient(90deg, #8fd3e8 0%, #f28b64 100%)" }}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate text-sm md:text-base text-white leading-normal font-semibold">{supportEmail}</span>
                </span>
                <Send className="h-3.5 w-3.5 shrink-0" />
              </a>

              <div className="pt-2 text-sm md:text-base text-black font-normal leading-normal">
                <p>If email does not open automatically, manually copy this email address.</p>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="mt-2 inline-flex items-center gap-2 rounded-md pl-3 font-medium leading-normal text-black transition-opacity hover:opacity-75"
                >
                  <Copy className="h-3.5 w-3.5 text-[#8b95a7]" />
                  {supportEmail}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SupportLayout>
  )
}
