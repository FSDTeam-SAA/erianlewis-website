import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const AccountHeader = () => {
  return (
    <div className="w-full bg-white border-b border-[#E5E7EB]">
      <div className="container flex items-center justify-between pt-2 pb-4">
        <div className="">
        <h1 className="text-2xl md:text-[28px] lg:text-[32px] font-bold leading-normal text-black">My Account</h1>
        <p className="text-sm md:text-base leading-normal font-normal text-[#262626]">Manage your account settings</p>
      </div>

      <div>
        <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 text-sm leading-normal font-medium text-black "
      >
        <ArrowLeft className="size-5" />
        Back
      </Link>
      </div>
      </div>
    </div>
  )
}
