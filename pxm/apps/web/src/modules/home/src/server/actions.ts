'use server'

import { SearchHitsMetadata } from '@elastic/elasticsearch/lib/api/types'

import { Fetcher } from '@amplifi-workspace/static-shared'
import { Attribute } from '@amplifi-workspace/store'

import {
  BrowseTreeItem,
  Collection,
  ItemType,
} from '../_common/types/collectionTypes'
import { ConditionType } from '../pages/home/search/types'
import {
  AccessAndFilter,
  getAccessAndFilterPayload,
  UserVisibilityPayload,
} from '../utils/actions'

export type CategoryTreePayload =
  | ({
      name?: string
      parent_id?: string
      roles: string
      version: 'V3'
    } & AccessAndFilter)
  | undefined
export async function getCategoryTree(
  payload: CategoryTreePayload
): Promise<BrowseTreeItem[]> {
  const response = await Fetcher<BrowseTreeItem[]>({
    url: `/product/browse/tree`,
    method: 'POST',
    payload,
  })

  return response
}

type SearchCategoryTreePayload = UserVisibilityPayload<{
  keyword: string
  region: string[]
}>
export async function searchCategoryTree({
  user,
  roleVisibility,
  payload,
}: SearchCategoryTreePayload) {
  const filterAndAccess = getAccessAndFilterPayload({
    user,
    filterOverride: {
      terms: {},
    },
    roleVisibility,
  })

  const response = await Fetcher<Omit<BrowseTreeItem, 'children'>[]>({
    url: '/product/browse/search',
    method: 'POST',
    payload: {
      ...payload,
      ...filterAndAccess,
      must_not: {
        term: {},
      },
    },
  })

  return response.map((item) => ({
    ...item,
    direct_parent: item.parent_category
      ? [
          /**
           * The parent category contains the item's own id and all the parent ids.
           * The direct parent is the id in this array that is not the same as the item's id.
           * It could be position 0 or 1.
           */
          item.parent_category[0] !== item.id
            ? item.parent_category[0]
            : item.parent_category[1],
        ]
      : [],
  }))
}

export interface NewCategoryPayload {
  attributes: string[]
  direct_parent: string[]
  inherit_parent: boolean
  name: string
  parent_category: string[]
  parent_id: string
  published: boolean
  published_end_date: string
  published_start_date: string
  region_ids: string[]
  status: string
}
interface NewCategoryResponse {
  attributes: string[]
  created_date: string
  direct_parent: string[]
  hostname: string
  id: string
  inherit_parent: boolean
  name: string
  parent_category: string[]
  parent_id: string
  published: boolean
  published_start_date: string
  published_end_date: string
  region_ids: string[]
  roles: string[]
  status: string
  sync_date: string
  updated_date: string
}
export async function createNewCategory(
  payload: NewCategoryPayload
): Promise<NewCategoryResponse> {
  const response = await Fetcher<NewCategoryResponse>({
    url: '/category',
    method: 'POST',
    payload,
  })

  return response
}

export type NewTopicPayload = NewCategoryPayload & {
  additional_title: string
}
type NewTopicResponse = NewCategoryResponse
export async function createNewTopic(
  payload: NewTopicPayload
): Promise<NewTopicResponse> {
  const response = await Fetcher<NewTopicResponse>({
    url: '/topic',
    method: 'POST',
    payload,
  })

  return response
}

interface DeleteCategoryOrTopicResponse {
  deleted: boolean
}
export async function deleteCategory(categoryId: string): Promise<boolean> {
  const response = await Fetcher<DeleteCategoryOrTopicResponse>({
    url: `/category/${categoryId}`,
    method: 'DELETE',
  })

  return response.deleted
}

export async function deleteTopic(topicId: string): Promise<boolean> {
  const response = await Fetcher<DeleteCategoryOrTopicResponse>({
    url: `/topic/${topicId}`,
    method: 'DELETE',
  })

  return response.deleted
}

export interface AssignToNodePayload {
  data: {
    ids: string[]
    parent_id: string
  }
  type: ItemType
}
interface AssignToNodeResult {
  updated: boolean
}
export async function assignToNode(
  payload: AssignToNodePayload
): Promise<boolean> {
  const { data, type } = payload
  if (type === 'category') {
    const response = await Fetcher<AssignToNodeResult>({
      url: `/category/assign`,
      method: 'PUT',
      payload: {
        ids: data.ids,
        entity_id: data.parent_id,
        entity: 'none',
      },
    })

    return response.updated
  } else if (type === 'topic') {
    const response = await Fetcher<
      {
        deleted: number
        errors: number
        inserted: number
        replaced: number
        skipped: number
        unchanged: number
      }[]
    >({
      url: '/folder/assign',
      method: 'PUT',
      payload: {
        entities: data.ids.map((id) => ({ id, type: 'topic' })),
        parent_id: data.parent_id,
      },
    })
    return response.some((r) => r.replaced > 0)
  }

  return false
}

export type ProductSearchPayload<T = unknown> = {
  from?: number
  size?: number
  search?: string
  sort?: string
  type?: ItemType[]
} & T &
  AccessAndFilter
export async function productSearch<T>(payload: ProductSearchPayload<T>) {
  const response = await Fetcher<SearchHitsMetadata<Collection>>({
    url: '/product/search',
    method: 'POST',
    payload,
  })

  return response
}

interface BulkPayload {
  bulk_search?: string
}
interface KeywordPayload {
  sku?: string
}
type SearchPayloadBase = {
  id: string
  advanced: 'true' | 'false'
  type: ItemType[]
  attributes?: {
    attribute_id: string
    attribute_name: string
    condition: ConditionType
    value: string
    value_type: string
  }[]
}
export type SearchPayload = ProductSearchPayload<
  SearchPayloadBase & (BulkPayload | KeywordPayload)
>

export async function advancedSearch(
  payload: SearchPayload
): Promise<SearchHitsMetadata<Collection>> {
  return productSearch(payload)
}

export type SearchTopicsPayload = ProductSearchPayload<{
  key: 'search'
}>
export async function searchTopics(
  payload: SearchTopicsPayload
): Promise<SearchHitsMetadata<Collection>> {
  return productSearch(payload)
}

export interface SearchAttributePayload {
  currentPage: number
  global_settings: boolean
  limit: number
  rowsPerPage: number
  search?: string
  sort_column: string
  sort_direction: 'asc' | 'desc'
  start: number
  exclude_attributes?: { id?: string }[]
}
interface SearchAttributeResponse {
  count: number
  data: Attribute[]
}
export async function searchAttribute(payload: SearchAttributePayload) {
  const response = await Fetcher<SearchAttributeResponse>({
    url: '/utility/attributes/grid',
    method: 'POST',
    payload,
  })

  return response
}
