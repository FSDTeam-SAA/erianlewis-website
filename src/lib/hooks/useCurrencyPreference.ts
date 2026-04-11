'use client'

import { useEffect } from 'react'

import { useCurrencyStore } from '@/lib/stores/currencyStore'

let hasRequestedInitialRates = false

export const useCurrencyPreference = () => {
  const selectedCurrency = useCurrencyStore(state => state.selectedCurrency)
  const setSelectedCurrency = useCurrencyStore(state => state.setSelectedCurrency)
  const rates = useCurrencyStore(state => state.rates)
  const isLoadingRates = useCurrencyStore(state => state.isLoadingRates)
  const ratesError = useCurrencyStore(state => state.ratesError)
  const fetchRates = useCurrencyStore(state => state.fetchRates)

  useEffect(() => {
    if (!hasRequestedInitialRates) {
      hasRequestedInitialRates = true
      void fetchRates()
    }
  }, [fetchRates])

  useEffect(() => {
    if (!rates[selectedCurrency]) {
      void fetchRates(true)
    }
  }, [fetchRates, rates, selectedCurrency])

  return {
    selectedCurrency,
    setSelectedCurrency,
    rates,
    isLoadingRates,
    ratesError,
    refreshRates: () => fetchRates(true),
  }
}
