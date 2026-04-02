import { Trash2 } from "lucide-react"



export const AccountDangerZone = () => {
  return (
    <div className="pt-6 pb-10">
      <div className="space-y-4">
        <div className="bg-[#FEF2F2] shadow-[1px_1px_4px_0px_#00000040] rounded-[12px] p-4">
          <h4 className="text-xl md:text-2xl font-bold leading-normal text-[#7F1D1D]">Account</h4>
          <p className="text-sm md:text-base font-normal leading-normal text-[#BB1C1C]">Delete your account is permanent.</p>
        </div>

        <div className="bg-white rounded-lg border border-[#ececf1] p-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-[#e53e3e] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#d63535]"
          >
            <Trash2 className="size-4" />
            Delete Account
          </button>
          <p className="mt-2 text-sm md:text-base leading-normal font-normal text-[#262626]">You&apos;ll need to enter your password to confirm.</p>
        </div>
      </div>
    </div>
  )
}
