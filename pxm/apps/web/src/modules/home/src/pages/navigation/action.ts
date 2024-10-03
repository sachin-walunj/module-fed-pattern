'use server'

import { Fetcher } from '@amplifi-workspace/static-shared'

// Fetch v3 preference from User
type updateV3PreferencePayload = {
  id: string
  v3_enabled: boolean
}

type updateV3PreferenceResponse = {
  updated: boolean
}

export const updateV3Preference = async (
  payload: updateV3PreferencePayload
) => {
  const response = await Fetcher<updateV3PreferenceResponse>({
    url: '/user',
    method: 'PUT',
    payload,
  })

  return response
}
