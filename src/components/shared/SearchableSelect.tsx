"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ChevronDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

export type SearchableSelectOption = {
  label: string
  value: string
}

type SearchableSelectProps = {
  value: string
  onChange: (value: string) => void
  options: SearchableSelectOption[]
  placeholder: string
  searchPlaceholder?: string
  emptyLabel?: string
  className?: string
  disabled?: boolean
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = "Search...",
  emptyLabel = "No options found",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selectedLabel = useMemo(
    () => options.find(option => option.value === value)?.label,
    [options, value],
  )

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return options
    }

    return options.filter(option =>
      option.label.toLowerCase().includes(normalizedQuery),
    )
  }, [options, query])

  useEffect(() => {
    if (!open) {
      setQuery("")
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-[8px] border border-[#D9DBE3] bg-white px-3 text-left text-sm text-[#111827] transition-colors outline-none hover:border-[#C9D3DF] focus-visible:border-[#8BCCE6]",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
      >
        <span className={cn(!selectedLabel && "text-[#98A2B3]")}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-[#98A2B3]" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-(--anchor-width) rounded-[12px] border border-[#D9E4EC] bg-white p-2 shadow-[0_20px_48px_rgba(15,23,42,0.14)]"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
          <Input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 rounded-[8px] border-[#D9DBE3] bg-white pl-9 text-sm"
          />
        </div>

        <ScrollArea className="max-h-64 overflow-hidden">
          <div className="space-y-1 pr-1">
            {filteredOptions.length ? (
              filteredOptions.map(option => {
                const isSelected = option.value === value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-sm font-medium text-[#344054] transition-colors hover:bg-[#F5F8FB]",
                      isSelected && "bg-[#EEF7FD] text-[#1D4F73]",
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected ? <Check className="h-4 w-4" /> : null}
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-4 text-sm text-[#98A2B3]">{emptyLabel}</div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
