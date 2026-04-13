import { NextResponse } from 'next/server'

const exchangeRateSources = [
  'https://open.er-api.com/v6/latest/USD',
  'https://api.frankfurter.app/latest?from=USD',
]

export async function GET() {
  const errors: string[] = []

  for (const source of exchangeRateSources) {
    try {
      const response = await fetch(source, {
        cache: 'no-store',
      })

      if (!response.ok) {
        errors.push(`${source}: ${response.status}`)
        continue
      }

      const payload = await response.json()
      const rates =
        payload?.rates && typeof payload.rates === 'object'
          ? payload.rates
          : null

      if (!rates) {
        errors.push(`${source}: invalid payload`)
        continue
      }

      if (Object.keys(rates).length < 100) {
        errors.push(`${source}: limited currency coverage`)
        continue
      }

      return NextResponse.json({
        status: true,
        data: {
          rates,
          source,
        },
      })
    } catch (error) {
      errors.push(
        `${source}: ${
          error instanceof Error ? error.message : 'Unknown upstream error'
        }`,
      )
    }
  }

  return NextResponse.json(
    {
      status: false,
      message:
        errors.join(' | ') || 'Failed to load exchange rates from all sources',
    },
    { status: 500 },
  )
}
