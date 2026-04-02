"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[420px] rounded-[32px] border border-[#e4ebf3] bg-white p-0 shadow-[0_28px_80px_rgba(15,23,42,0.18)]"
      >
        <div className="px-7 pb-7 pt-7">
          <DialogHeader className="items-start text-left">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(139,204,230,0.14),rgba(246,133,92,0.16))]">
              <LogOut className="h-7 w-7 text-[#f6855c]" />
            </div>
            <DialogTitle className="text-[32px] font-extrabold leading-none tracking-tight text-[#111827]">
              Log out now?
            </DialogTitle>
            <DialogDescription className="mt-3 max-w-[300px] text-[16px] font-medium leading-8 text-[#667085]">
              You&apos;ll be signed out of your current session and returned to the homepage.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex items-center justify-end gap-3 rounded-b-[32px] border-t border-[#eef2f6] bg-[#f8fafc] px-7 py-5">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full border-[#d8e0ea] bg-white px-7 text-[16px] font-semibold text-[#4b5563] shadow-sm hover:bg-[#f9fafb]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-11 rounded-full px-7 text-[16px] font-semibold text-white shadow-md hover:opacity-90"
            style={{
              background:
                "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)",
            }}
            onClick={onConfirm}
          >
            Yes, log out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
