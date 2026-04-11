'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CURRENCY_OPTIONS, getCurrencyLabel, normalizeCurrencyCode } from '@/lib/currency'
import { cn } from '@/lib/utils'

type CurrencySelectorProps = {
  value: string
  onChange: (value: string) => void
  buttonClassName?: string
  contentClassName?: string
  align?: 'start' | 'center' | 'end'
}

export function CurrencySelector({
  value,
  onChange,
  buttonClassName,
  contentClassName,
  align = 'end',
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selectedCurrency = normalizeCurrencyCode(value)

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return CURRENCY_OPTIONS
    }

    return CURRENCY_OPTIONS.filter(option =>
      option.label.toLowerCase().includes(normalizedQuery),
    )
  }, [query])

  return (
    <Popover open={open} onOpenChange={nextOpen => {
      setOpen(nextOpen)

      if (!nextOpen) {
        setQuery('')
      }
    }}>
      <PopoverTrigger
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2 text-sm font-medium text-[#4b5563] shadow-sm transition-colors hover:bg-[#fafafa]',
          buttonClassName,
        )}
      >
        <span>{selectedCurrency}</span>
        <ChevronDown className="h-4 w-4 text-[#6b7280]" />
      </PopoverTrigger>

      <PopoverContent
        align={align}
        sideOffset={8}
        className={cn(
          'w-[300px] rounded-[16px] border border-[#d9e4ec] bg-white p-2 shadow-[0_20px_48px_rgba(15,23,42,0.14)]',
          contentClassName,
        )}
      >
        <div className="rounded-[12px] border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#98a2b3]">
            Display Currency
          </p>
          <p className="mt-1 text-sm font-semibold text-[#111827]">
            {getCurrencyLabel(selectedCurrency)}
          </p>
        </div>

        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
          <Input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search currency..."
            className="h-10 rounded-[10px] border-[#D9DBE3] bg-white pl-9 text-sm"
          />
        </div>

        <ScrollArea className="max-h-72 overflow-hidden">
          <div className="space-y-1 pr-1">
            {filteredOptions.map(option => {
              const isSelected = option.value === selectedCurrency

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left text-sm font-medium text-[#344054] transition-colors hover:bg-[#F5F8FB]',
                    isSelected && 'bg-[#EEF7FD] text-[#1D4F73]',
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected ? <Check className="h-4 w-4" /> : null}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
