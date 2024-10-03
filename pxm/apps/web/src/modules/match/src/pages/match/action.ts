'use server'

import { Fetcher } from '@amplifi-workspace/static-shared'

import {
  FetchMatchifyProductsRequestType,
  FetchMatchifyProductsResponseType,
  SummaryResponseType,
} from './types'

export async function fetchMatchifyProducts(
  payload: FetchMatchifyProductsRequestType
) {
  const response = await Fetcher<FetchMatchifyProductsResponseType>({
    url: '/matchifi-product/Amazon/US',
    method: 'POST',
    payload,
  })

  return response
}

export async function fetchSummary(payload: {
  marketplace: string
  code: string
}) {
  const { marketplace, code } = payload
  const response = await Fetcher<SummaryResponseType>({
    url: `/matchifi-product/summary?marketplace=${marketplace}&code=${code}`,
    method: 'GET',
  })

  return response
}
