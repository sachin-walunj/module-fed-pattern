'use server'
import { Fetcher } from '@amplifi-workspace/static-shared'

import { StackGroup } from './image-stack-layout/ImageStackLayout'

export async function getStackGroups(): Promise<StackGroup[]> {
  const response = await Fetcher<{ data: StackGroup[] }>({
    url: '/stack_group',
    method: 'GET',
  })

  return response.data
}

export interface CreateStackPayload {
  stack_group_id: string
  files: (string | number)[] //not sure on this type
  topic_id: string
}

export interface CreateOrDeleteStackResponse {
  deleted: number
  errors: number
  generated_keys: string[]
  inserted: number
  replaced: number
  skipped: number
  unchanged: number
}

export async function createStack(
  payload: CreateStackPayload
): Promise<CreateOrDeleteStackResponse> {
  const response = await Fetcher<CreateOrDeleteStackResponse>({
    url: '/stack',
    method: 'POST',
    payload: payload,
  })

  return response
}

export async function deleteImageStack(stackId: string) {
  const response = await Fetcher<CreateOrDeleteStackResponse>({
    url: `/stack/${stackId}`,
    method: 'DELETE',
  })
  return response
}
