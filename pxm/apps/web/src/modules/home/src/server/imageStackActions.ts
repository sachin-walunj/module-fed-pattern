'use server'

import { Fetcher } from '@amplifi-workspace/static-shared'

export interface GetImageStackPayload {
  topic_id: string
  page: 1
}

interface ImageStack {
  stack_group_name: string
  id: string
  created_date: string
  files: {
    file_name: string
    id: string
  }[]
}

interface GetImageStackResponse {
  pagination: {
    current_page: number
    total_pages: number
    first_page: boolean
    last_page: boolean
    previous_page: number | null
    next_page: number | null
  }
  data: ImageStack[]
}

export async function getImageStack(payload: GetImageStackPayload) {
  let url = `/stack?topic_id=${payload.topic_id}&page=1`
  let response = await Fetcher<GetImageStackResponse>({
    url: url,
    method: 'GET',
  })
  let result: ImageStack[] = response.data
  while (!response.pagination.last_page) {
    url = `/stack?topic_id=${payload.topic_id}&page=${response.pagination.next_page}`
    response = await Fetcher<GetImageStackResponse>({
      url: url,
      method: 'GET',
    })
    result = [...result, ...response.data]
  }
  return result
}

interface UpdateImageStackOrderResponse {
  deleted: number
  errors: number
  inserted: number
  replaced: number
  skipped: number
  unchanged: number
}

export async function updateImageStackOrder(
  imageStackId: string,
  fileIds: string[]
): Promise<UpdateImageStackOrderResponse> {
  const response = await Fetcher<UpdateImageStackOrderResponse>({
    url: `/stack/${imageStackId}`,
    method: 'PUT',
    payload: {
      files: fileIds,
    },
  })

  return response
}
