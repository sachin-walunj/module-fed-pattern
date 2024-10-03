'use server'

import { Fetcher } from '@amplifi-workspace/static-shared'

import { ExtendedTopic } from './AttributesContent'
import { Topic } from '../../../_common/types/collectionTypes'

export type AttributeGroup = {
  id: string
  name: string
}

export type GetAttributeGroupsResponse = {
  attribute_groups: AttributeGroup[]
  language_codes: string[]
}

export const getAttributeGroups = async (
  collectionId: string,
  payload: string
) => {
  const parsedPayload = JSON.parse(payload)

  const response = await Fetcher<GetAttributeGroupsResponse>({
    url: `/product/${collectionId}/attributes/filter-options`,
    method: 'POST',
    payload: parsedPayload,
  })

  return response
}

export const updateTopic = async (
  updatedTopicData: ExtendedTopic
): Promise<Topic> => {
  const response = await Fetcher<Topic>({
    url: '/topic',
    method: 'PUT',
    payload: updatedTopicData,
  })

  return response
}
