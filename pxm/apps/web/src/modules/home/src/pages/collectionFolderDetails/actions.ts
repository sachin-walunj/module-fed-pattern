'use server'

import { QueryDslBoolQuery } from '@elastic/elasticsearch/lib/api/types'

import { Fetcher } from '@amplifi-workspace/static-shared'
import { IUserState, RawOption } from '@amplifi-workspace/store'

import { Topic } from '../../_common/types/collectionTypes'
import { productSearch } from '../../server/actions'
import { getActiveRegions } from '../../utils/actions'

export async function getTopic(topicId: string) {
  return Fetcher<Topic>({ url: `/topic/${topicId}` })
}

type GetProductSearchBase = {
  topicId: string
  search?: string
  user: IUserState
}
type GetVariantsProductSearch = GetProductSearchBase & {
  key: 'variant'
  parentTopicId: string
}
type GetCollectionsProductSearch = GetProductSearchBase & {
  key: 'collection' | 'parent'
  parentTopicId?: never
}
type GetProductSearch = GetVariantsProductSearch | GetCollectionsProductSearch

export async function getProductSearch({
  topicId,
  parentTopicId,
  search = '',
  user,
  key,
}: GetProductSearch) {
  const region = getActiveRegions(user),
    roles = user?.role

  const filter: QueryDslBoolQuery['filter'] =
    key === 'variant'
      ? {
          bool: {
            must_not: {
              term: {
                id: topicId,
              },
            },
            should: [
              {
                term: {
                  parent_topic_id: parentTopicId,
                },
              },
              {
                term: {
                  id: parentTopicId,
                },
              },
            ],
          },
          term: {
            roles,
          },
          terms: {
            collection_type: ['parent', 'variant'],
            region,
          },
        }
      : key === 'collection'
      ? {
          term: {
            roles,
          },
          terms: {
            parent_topic_id: [topicId],
            region,
          },
        }
      : key === 'parent'
      ? {
          term: {
            roles,
          },
          terms: {
            collection_type: ['variant'],
            parent_topic_id: [topicId],
            region,
          },
        }
      : undefined

  return productSearch({
    access: {
      empty_category_hierarchy: false,
      empty_category_result: false,
      empty_topic: false,
    },
    filter,
    key: 'variations',
    roles,
    search,
    type: ['topic'],
  })
}

export interface ProductSearchPayload {
  filter: {
    terms: {
      topics: string[]
      roles: string[]
      region: string[]
    }
  }
  type: string[]
  search: string
  sort: string
  from: string
  size: string
}

export interface ProductSearchResponse {
  total: number
  max_score: number | null
  hits: Array<{
    _index: string
    _id: string
    _score: number
    _source: {
      id: string
      file_name: string
      file_path: string
    }
  }>
  parent: string[]
}

export async function searchProducts(
  payload: ProductSearchPayload,
  pageParam = 0
) {
  const updatedPayload = {
    ...payload,
    from: String(pageParam * parseInt(payload.size)),
  }

  const response = await Fetcher<ProductSearchResponse>({
    url: '/product/search',
    method: 'POST',
    payload: updatedPayload,
  })

  return response
}

export interface unAssignEntityFromCollectionPayload {
  ids: string[]
  entities: Array<{
    type: string
    id: string
  }>
}

export interface unAssignEntityFromCollectionResponse {
  updated: boolean
}

export async function unAssignEntityFromCollection(
  payload: unAssignEntityFromCollectionPayload
): Promise<unAssignEntityFromCollectionResponse> {
  return Fetcher<unAssignEntityFromCollectionResponse>({
    url: '/file/unassign',
    method: 'PUT',
    payload,
  })
}
export interface LinkData {
  image: string
  topics: string[]
  link: string
  description: string
  details: string
  created_date: string
  id: string
}

export interface FetchLinksPayload {
  start: number
  limit: number
  sort_column: string
  sort_direction: string
  entity: string
  entity_id: string
  reset_current_page: boolean
  sort: string
}

export interface LinkResponse {
  count: number
  data: LinkData[]
}
export async function fetchLinks(
  payload: FetchLinksPayload
): Promise<LinkResponse> {
  return Fetcher<LinkResponse>({
    url: '/resource/grid',
    method: 'POST',
    payload,
  })
}

export interface DeleteLinkPayload {
  id: string
  topics?: string[]
  entities?: Array<{ id: string; topics: string[] }>
  metadata: {
    initiated_by: string
  }
}

export interface AddOrDeleteLinkResponse {
  created_date: string
  description: string
  details: string
  hostname: string
  id: string
  image: string
  link: string
  metadata: {
    browser: string
    initiated_by: string
    os: string
    platform: string
    request_id: string
    source: string
    version: string
  }
  status: string
  sync_date: string
  topics: string[]
  updated_date: string
}

export async function deleteLink(
  payload: DeleteLinkPayload
): Promise<AddOrDeleteLinkResponse> {
  return Fetcher<AddOrDeleteLinkResponse>({
    url: '/resource',
    method: 'PUT',
    payload,
  })
}

export interface GetListingsPayload {
  topicId?: string
  sort_column?: string
  sort_direction?: string
  page?: number
  limit?: number
  search?: string
}

export async function getListings(payload: GetListingsPayload) {
  if (payload.topicId) {
    return Fetcher<UnAssociateListingResponse>({
      url: `/listing/grid?sort_column=${payload?.sort_column}&sort_direction=${
        payload?.sort_direction
      }&topic_id=${payload?.topicId}&page=${payload?.page}&limit=${
        payload?.limit
      }${
        payload?.search && payload?.search?.length > 0
          ? `&search=${payload?.search}`
          : ``
      }`,
    })
  } else {
    return Fetcher<UnAssociateListingResponse>({
      url: `/listing/grid?sort_column=${payload?.sort_column}&sort_direction=${
        payload?.sort_direction
      }&exlude_associated=true&page=${payload?.page}&limit=${payload?.limit}${
        payload?.search && payload?.search?.length > 0
          ? `&search=${payload?.search}`
          : ``
      }`,
    })
  }
}
export interface ListingFromTopicType {
  ids: string[]
  topic_id?: string
}

export interface ListingFromTopicRepsType {
  updated: number
}

export async function removeListingFromTopic(
  payload: ListingFromTopicType
): Promise<ListingFromTopicRepsType> {
  const response = await Fetcher<ListingFromTopicRepsType>({
    url: '/listing/unassign',
    method: 'PUT',
    payload: payload,
  })
  return response
}
export interface paginationType {
  count: number
  current_page: number
  total_pages: number
  per_page: number
  first_page: boolean
  last_page: boolean
  previous_page: number | null
  next_page: number
  out_of_range: boolean
}
export interface UnAssociateListingPayload {
  currentPage: number
  limit: number
  rowsPerPage: number
  search?: string
  sort_column: string
  sort_direction: 'asc' | 'desc'
  exclude_attributes?: { id?: string }[]
}

export interface listingObject {
  marketplace_channel_id: string
  mp_secondary_id: string
  listing_id: string
  mp_primary_id: string
  name: string
  id: string
  updated_date: string
  topic_id: null | string
  total?: null | string
}
export interface UnAssociateListingResponse {
  pagination: paginationType
  data: listingObject[]
}

export async function getUnAssociateListing(
  payload: UnAssociateListingPayload
) {
  const response = await Fetcher<UnAssociateListingResponse>({
    url: `/listing/grid?exlude_associated=true&sort_column=updated_date&sort_direction=desc${
      payload?.search?.length !== 0 ? `&search=${payload?.search}` : ``
    }&limit=${payload.rowsPerPage}&page=${payload.currentPage}`,
    method: 'GET',
    payload,
  })
  return response
}

export async function assignListingFromTopic(
  payload: ListingFromTopicType
): Promise<ListingFromTopicRepsType> {
  const response = await Fetcher<ListingFromTopicRepsType>({
    url: '/listing/assign',
    method: 'PUT',
    payload: payload,
  })
  return response
}
export interface ProductSearchPayloadForAddExistingMedia {
  type: string[]
  filter: {
    metadata: Record<string, unknown>
    range: Record<string, unknown>
    term: {
      roles: string
    }
    terms: {
      region: string[]
    }
    exists: Record<string, unknown>
  }
  must_not: {
    terms: {
      topics: string[]
    }
  }
  key: string
  search: string
  roles: string
  access: {
    empty_category_result: boolean
    empty_category_hierarchy: boolean
    empty_topic: boolean
  }
}

export interface ProductSearchResponseForAddExistingMedia {
  total: number
  max_score: number
  hits: Array<{
    _id: string
    _index: string
    _score: number
    _source: {
      id: string
      file_name: string
      file_path: string
      created_date: string
      //other properties as needed
    }
  }>
  parent: null
}

export async function productSearchForAddExistingMedia(
  payload: ProductSearchPayloadForAddExistingMedia
): Promise<ProductSearchResponseForAddExistingMedia> {
  return Fetcher<ProductSearchResponseForAddExistingMedia>({
    url: '/product/search',
    method: 'POST',
    payload,
  })
}

interface AssignFilesToTopicPayload {
  ids: string[]
  entities: Array<{
    type: string
    id: string
  }>
}

interface AssignFilesToTopicResponse {
  updated: boolean
}

export async function assignFilesToTopic(
  payload: AssignFilesToTopicPayload
): Promise<AssignFilesToTopicResponse> {
  return Fetcher<AssignFilesToTopicResponse>({
    url: '/file/assign',
    method: 'PUT',
    payload,
  })
}
export interface AddLinkData {
  image: string
  topics: string[]
  link: string
  description: string
  details: string
  metadata: { initiated_by: string }
  status: string
}

export async function addLink(
  payload: AddLinkData
): Promise<AddOrDeleteLinkResponse> {
  return Fetcher<AddOrDeleteLinkResponse>({
    url: '/resource',
    method: 'POST',
    payload,
  })
}

type fetchUrlResponse = {
  description: string
  image: string
  title: string
}

export const fetchUrlPreview = async (url: string) => {
  const response = await Fetcher<fetchUrlResponse>({
    url: `/utility/link-preview?url=${decodeURI(url)}`,
    method: 'GET',
  })
  return response
}

export interface FileDetails {
  manual_label: string[]
  topics: Array<{
    id: string
    name: string
    is_hero: boolean
  }>
  file_name: string
  created_date: string
  file_size: string
  format: string
  use_master_file: boolean
  variants: {
    [key: string]: {
      [format: string]: {
        dimension: string
        size: string
        transparency: boolean
      }
    }
  }
  metadata: {
    [key: string]: string | number
  }
  attributes: {
    collection_count: number
    file_count: number
    group_id: string[]
    hostname: string
    id: string
    is_file_filter: boolean
    is_topic_filter: boolean
    label: string
    language_code: string
    maximum: number
    minimum: number
    options: RawOption[]
    region_ids: string[]
    roles: string[]
    value: string
    value_type: string
  }[]
  published: boolean
  region_ids: string[]
  roles: string[]
}

export async function getFileDetails(fileId: string): Promise<FileDetails> {
  return Fetcher<FileDetails>({
    url: `/file/${fileId}`,
    method: 'GET',
  })
}
