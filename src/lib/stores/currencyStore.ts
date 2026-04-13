'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  buildCurrencyRates,
  DEFAULT_CURRENCY,
  normalizeCurrencyCode,
  type CurrencyRates,
} from '@/lib/currency'

const RATES_REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000
let ratesRequest: Promise<void> | null = null

type CurrencyStore = {
  selectedCurrency: string
  rates: CurrencyRates
  isLoadingRates: boolean
  ratesError: string | null
  lastUpdated: number | null
  setSelectedCurrency: (currency: string) => void
  fetchRates: (force?: boolean) => Promise<void>
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      selectedCurrency: DEFAULT_CURRENCY,
      rates: buildCurrencyRates(),
      isLoadingRates: false,
      ratesError: null,
      lastUpdated: null,
      setSelectedCurrency: currency =>
        set({ selectedCurrency: normalizeCurrencyCode(currency) }),
      fetchRates: async (force = false) => {
        if (ratesRequest) {
          return ratesRequest
        }

        const { isLoadingRates, lastUpdated, rates } = get()

        if (isLoadingRates) {
          return
        }

        const hasFreshRates =
          !force &&
          lastUpdated &&
          Date.now() - lastUpdated < RATES_REFRESH_INTERVAL_MS &&
          Object.keys(rates).length > 1

        if (hasFreshRates) {
          return
        }

        set({ isLoadingRates: true, ratesError: null })

        ratesRequest = (async () => {
          try {
            const response = await fetch('/api/exchange-rates', {
              cache: 'no-store',
            })

            if (!response.ok) {
              throw new Error('Failed to load exchange rates')
            }

            const payload = (await response.json()) as {
              status?: boolean
              message?: string
              data?: {
                rates?: CurrencyRates
              }
            }

            if (!payload?.status) {
              throw new Error(payload?.message || 'Failed to load exchange rates')
            }

            set({
              rates: buildCurrencyRates(payload.data?.rates),
              lastUpdated: Date.now(),
              isLoadingRates: false,
              ratesError: null,
            })
          } catch (error) {
            set({
              isLoadingRates: false,
              ratesError:
                error instanceof Error
                  ? error.message
                  : 'Failed to load exchange rates',
            })
          } finally {
            ratesRequest = null
          }
        })()

        return ratesRequest
      },
    }),
    {
      name: 'currency-preference',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        selectedCurrency: state.selectedCurrency,
        rates: state.rates,
        lastUpdated: state.lastUpdated,
      }),
    },
  ),
)
