'use server'

import { Fetcher } from '@amplifi-workspace/static-shared'
import { featuredFolderResponseTypes } from '@amplifi-workspace/store'

export interface featuredFolderTypes {
  filter: { terms: { region: string[] } }
  isLandingPage: boolean
  region: string[]
  roles: string
}

export const getFeaturedFolders = async (payload: featuredFolderTypes) => {
  const response = await Fetcher<featuredFolderResponseTypes>({
    url: '/product/featured/topic',
    method: 'POST',
    payload,
  })

  return response
}
