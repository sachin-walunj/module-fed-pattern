'use server'

import { Fetcher } from '@amplifi-workspace/static-shared'

// Fetch Lightbox
type fetchLightboxPayload = {
  id: string
  shared?: boolean
  user_id: string
  sort_column: string
  sort_direction: string
}

type fetchLightboxResponse = {
  created_by: string
  created_date: string
  id: string
  item_count: number
  name: string
  read_roles: string[]
  write_roles: string[]
}

export const fetchLightbox = async (payload: fetchLightboxPayload) => {
  const response = await Fetcher<fetchLightboxResponse[]>({
    url: '/lightbox/list',
    method: 'POST',
    payload,
  })

  return response
}

// Fetch Lightbox Items
type fetchLightboxItemPayload = {
  id: string
}

type lightboxItem = {
  id: string
  name: string
  display_file: string
  file_type: string
  type: string
  image_url?: string
}[]

export type fetchLightboxItemResponse = {
  id: string
  name: string
  is_publishable_to_channels: boolean
  read_roles: string[]
  write_roles: string[]
  user_id: string
  items: lightboxItem
  created_date: string
  updated_date: string
  updated_by: string
  hostname: string
  created_by: string
}

export const fetchLightboxItems = async (payload: fetchLightboxItemPayload) => {
  const response = await Fetcher<fetchLightboxItemResponse>({
    url: `/lightbox/${payload.id}`,
    method: 'GET',
  })

  return response
}

// Create New Lightbox
export type createNewLightboxPayload = {
  items: lightboxItem
  metadata: { initiated_by: string }
  name: string
  read_roles?: string[]
  write_roles?: string[]
  user_id?: string
}

export const createNewLightbox = async (payload: createNewLightboxPayload) => {
  const response = await Fetcher<fetchLightboxItemResponse>({
    url: '/lightbox',
    method: 'POST',
    payload,
  })

  return response
}

// Assign Items to Lightbox
export type assignItemsToLightboxPayload = {
  entity: string
  entity_id: string
  ids: {
    id: string
    name: string
    type: string
  }[]
}

export type assignItemsToLightboxResponse = {
  updated: boolean
}

export const assignItemsToLightbox = async (
  payload: assignItemsToLightboxPayload
): Promise<assignItemsToLightboxResponse> => {
  const response = await Fetcher<assignItemsToLightboxResponse>({
    url: '/lightbox/assign',
    method: 'PUT',
    payload,
  })
  return response
}

// Assign Settings to Lightbox
type assignSettingsToLightboxResponse = {
  id: string
  read_roles: string[]
  write_roles: string[]
}

export const assignSettingsToLightbox = async (
  payload: assignSettingsToLightboxResponse
) => {
  const response = await Fetcher<assignSettingsToLightboxResponse>({
    url: '/lightbox',
    method: 'PUT',
    payload,
  })
  return response
}

// Fetch Editable Lightboxes List
type fetchEditableLightboxesListPayload = {
  sort_column: string
  sort_direction: string
  shared_type: string
}

type fetchEditableLightboxesListResponse = {
  created_by: string
  created_date: string
  id: string
  name: string
  read_roles: string[]
  user_id: string
  write_roles: string[]
}

export const fetchEditableLightboxesList = async (
  payload: fetchEditableLightboxesListPayload
) => {
  const response = await Fetcher<fetchEditableLightboxesListResponse[]>({
    url: '/lightbox/accessible-list',
    method: 'GET',
    payload,
  })

  return response
}

// Add to Lightbox via Create New Lightbox
export type AddToLightboxViaCreateNewPayload = {
  items: {
    id: string
    name: string
    type: string
  }[]
  name: string
  read_roles: string[]
  write_roles: string[]
  metadata: {
    initiated_by: string
  }
}

export const AddToLightboxViaCreateNew = async (
  payload: AddToLightboxViaCreateNewPayload
) => {
  const response = await Fetcher<fetchLightboxItemResponse>({
    url: '/lightbox',
    method: 'POST',
    payload,
  })
  return response
}

// Delete Lightbox
type deleteLightboxPayload = {
  id: string
}

export const deleteLightbox = async (payload: deleteLightboxPayload) => {
  const response = await Fetcher<{ deleted: boolean }>({
    url: `/lightbox/${payload.id}`,
    method: 'DELETE',
  })

  return response
}

// Reorder Items of lightbox
type reorderLightboxItemsPayload = {
  id: string
  name: string
  items: lightboxItem
  metadata: {
    initiated_by: string
  }
}

export const reorderLightboxItems = async (
  payload: reorderLightboxItemsPayload
) => {
  const response = await Fetcher<fetchLightboxItemResponse>({
    url: '/lightbox',
    method: 'PUT',
    payload,
  })

  return response
}

// Delete Lightbox Item
type deleteLightboxItemPayload = {
  entity: string
  entity_id: string
  ids: {
    id: string
    name: string
    type: string
    file_type: string
    display_file: string
  }[]
}

export const deleteLightboxItem = async (
  payload: deleteLightboxItemPayload
) => {
  const response = await Fetcher<{ updated: boolean }>({
    url: '/lightbox/unassign',
    method: 'PUT',
    payload,
  })

  return response
}
