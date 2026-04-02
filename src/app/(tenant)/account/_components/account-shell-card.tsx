import { ReactNode } from "react"

import { cn } from "@/lib/utils"

type AccountShellCardProps = {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export const AccountShellCard = ({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: AccountShellCardProps) => {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || description || action) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {title ? <h2 className="text-lg md:text-xl lg:text-2xl leading-normal font-bold text-black">{title}</h2> : null}
            {description ? <p className="text-sm text-[#6b7280]">{description}</p> : null}
          </div>
          {action}
        </div>
      )}

      <div className={cn("rounded-xl border border-[#e6e6eb] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]", bodyClassName)}>
        {children}
      </div>
    </section>
  )
}
