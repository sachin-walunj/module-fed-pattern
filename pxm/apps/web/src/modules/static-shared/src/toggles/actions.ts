'use server'

import { headers } from 'next/headers'

export async function getToggles() {
  const AMP_DISTRIBUTION_KEY = '0ef94eef-bf6d-4720-bf49-4e4c33d8401a'
  const url = headers().get('host')

  const environment = url?.includes('localhost')
    ? 'development'
    : url?.includes('stage')
    ? 'staging'
    : 'production'

  const toggleResponse = await fetch(
    `https://toggle-api.usepredict.com/cdn/${AMP_DISTRIBUTION_KEY}/${environment}`
  )
  const toggles = (await toggleResponse.json()) as {
    key: string
    enabled: boolean
  }[]
  return toggles
}
