import { code as getCurrencyByCode, data as currencyData } from 'currency-codes'

export const DEFAULT_CURRENCY = 'USD'
export type CurrencyRates = Record<string, number>

export const CURRENCY_OPTIONS = currencyData
  .filter(currency => currency.code && currency.currency)
  .map(currency => ({
    value: currency.code,
    label: `${currency.code} - ${currency.currency}`,
  }))
  .sort((first, second) => first.label.localeCompare(second.label))

export const normalizeCurrencyCode = (currency?: string | null) => {
  const normalizedCurrency = currency?.trim().toUpperCase()

  if (!normalizedCurrency) {
    return DEFAULT_CURRENCY
  }

  return getCurrencyByCode(normalizedCurrency)?.code || normalizedCurrency
}

export const getCurrencyLabel = (currency?: string | null) => {
  const normalizedCurrency = normalizeCurrencyCode(currency)
  const match = getCurrencyByCode(normalizedCurrency)

  if (!match) {
    return normalizedCurrency
  }

  return `${match.code} - ${match.currency}`
}

export const formatNumberValue = (value?: number | null) =>
  new Intl.NumberFormat('en-US').format(value || 0)

export const formatPriceWithCurrency = (
  value?: number | null,
  currency?: string | null,
) => `${normalizeCurrencyCode(currency)} ${formatNumberValue(value)}`

export const buildCurrencyRates = (rates?: CurrencyRates): CurrencyRates => ({
  [DEFAULT_CURRENCY]: 1,
  ...(rates || {}),
})

export const convertCurrencyAmount = (
  value?: number | null,
  fromCurrency?: string | null,
  toCurrency?: string | null,
  rates?: CurrencyRates,
) => {
  const amount = value || 0
  const sourceCurrency = normalizeCurrencyCode(fromCurrency)
  const targetCurrency = normalizeCurrencyCode(toCurrency)

  if (sourceCurrency === targetCurrency) {
    return amount
  }

  const normalizedRates = buildCurrencyRates(rates)
  const sourceRate = normalizedRates[sourceCurrency]
  const targetRate = normalizedRates[targetCurrency]

  if (!sourceRate || !targetRate) {
    return null
  }

  return (amount / sourceRate) * targetRate
}

export const formatConvertedPrice = (
  value?: number | null,
  fromCurrency?: string | null,
  toCurrency?: string | null,
  rates?: CurrencyRates,
) => {
  const convertedAmount = convertCurrencyAmount(
    value,
    fromCurrency,
    toCurrency,
    rates,
  )

  if (convertedAmount === null) {
    return formatPriceWithCurrency(value, fromCurrency)
  }

  return `${normalizeCurrencyCode(toCurrency)} ${formatNumberValue(convertedAmount)}`
}
