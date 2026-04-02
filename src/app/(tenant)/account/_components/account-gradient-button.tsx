import { ButtonHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

type AccountGradientButtonProps = {
  children: ReactNode
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

export const AccountGradientButton = ({ children, className, type = "button", ...props }: AccountGradientButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      style={{ background: "linear-gradient(90deg, #9fd6e8 0%, #f58a63 100%)" }}
      {...props}
    >
      {children}
    </button>
  )
}
