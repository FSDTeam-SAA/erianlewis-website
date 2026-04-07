"use client"

import { useState } from "react"

import { useMutation } from "@tanstack/react-query"
import { signOut, useSession } from "next-auth/react"
import { AlertTriangle, Eye, EyeOff, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { AccountGradientButton } from "./account-gradient-button"
import { ApiSuccessResponse } from "./user-data-type"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export const AccountDangerZone = () => {
  const { data: session } = useSession()
  const token = session?.user?.accessToken
  const [modalOpen, setModalOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmationText, setConfirmationText] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/me`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: password,
        }),
      })

      const result: ApiSuccessResponse = await response.json()

      if (!response.ok || !result.status) {
        throw new Error(result.message || "Failed to delete account")
      }

      return result
    },
    onSuccess: async () => {
      setModalOpen(false)
      setPassword("")
      setConfirmationText("")
      toast.success("Your account has been deleted.")
      await signOut({ callbackUrl: "/sign-in?deleted=1" })
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : "Failed to delete account")
    },
  })

  const handleDeleteAccount = () => {
    if (!token) {
      toast.error("You need to sign in again to delete your account.")
      return
    }

    if (!password.trim()) {
      toast.error("Enter your password to confirm account deletion.")
      return
    }

    if (confirmationText.trim().toUpperCase() !== "DELETE") {
      toast.error('Type "DELETE" to confirm this action.')
      return
    }

    mutate()
  }

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
            onClick={() => {
              setModalOpen(true)
              setPassword("")
              setConfirmationText("")
              setShowPassword(false)
            }}
            className="inline-flex items-center gap-2 rounded-md bg-[#e53e3e] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#d63535]"
          >
            <Trash2 className="size-4" />
            Delete Account
          </button>
          <p className="mt-2 text-sm md:text-base leading-normal font-normal text-[#262626]">You&apos;ll need to enter your password to confirm.</p>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={open => !isPending && setModalOpen(open)}>
        <DialogContent className="max-w-[520px] rounded-[20px] border border-[#F3D1D1] bg-white p-0" showCloseButton={!isPending}>
          <div className="px-6 py-6">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FEF2F2] text-[#B42318]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-[#7F1D1D]">Delete your account</DialogTitle>
                  <DialogDescription className="mt-1 text-sm leading-6 text-[#7A271A]">
                    This permanently removes your profile and associated account access.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-5 rounded-[12px] border border-[#FEE4E2] bg-[#FFF7F6] px-4 py-3 text-sm text-[#912018]">
              This action cannot be undone. To continue, enter your password and type <span className="font-semibold">DELETE</span>.
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#344054]">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    placeholder="Enter your current password"
                    className="h-11 rounded-[8px] border-[#D9DBE3] pr-12"
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] transition-colors hover:text-[#111827]"
                    onClick={() => setShowPassword(current => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isPending}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#344054]">Type DELETE to confirm</label>
                <Input
                  value={confirmationText}
                  onChange={event => setConfirmationText(event.target.value)}
                  placeholder="DELETE"
                  className="h-11 rounded-[8px] border-[#D9DBE3]"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#FDE8E8] bg-[#FFF8F8] px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={isPending}
              className="rounded-[8px] border-[#D9DBE3] bg-white text-[#475467]"
            >
              Cancel
            </Button>
            <AccountGradientButton
              type="button"
              onClick={handleDeleteAccount}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? "Deleting..." : "Permanently Delete"}
            </AccountGradientButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
