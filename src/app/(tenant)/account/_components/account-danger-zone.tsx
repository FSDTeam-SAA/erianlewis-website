import { Trash2 } from "lucide-react"

import { AccountShellCard } from "./account-shell-card"

export const AccountDangerZone = () => {
  return (
    <AccountShellCard title="Account">
      <div className="space-y-4 p-4 sm:p-5">
        <div className="rounded-lg border border-[#f0c6cb] bg-[#fff5f5] p-4">
          <p className="text-sm font-semibold text-[#c93c4b]">Delete your account is permanent.</p>
        </div>

        <div className="rounded-lg border border-[#ececf1] p-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-[#e53e3e] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#d63535]"
          >
            <Trash2 className="size-4" />
            Delete Account
          </button>
          <p className="mt-3 text-xs text-[#6b7280]">You&apos;ll need to enter your password to confirm.</p>
        </div>
      </div>
    </AccountShellCard>
  )
}
