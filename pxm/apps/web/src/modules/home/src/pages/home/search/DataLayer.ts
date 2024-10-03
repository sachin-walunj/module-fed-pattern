import { SearchAttribute, SearchFilter, SearchOptionType } from './types'
import { Collection } from '../../../_common/types/collectionTypes'
import {
  advancedSearch,
  searchAttribute,
  SearchAttributePayload,
  SearchPayload,
} from '../../../server/actions'
import {
  getAccessAndFilterPayload,
  UserVisibilityPayload,
} from '../../../utils/actions'
import { getSourceFromSearchHit } from '../../../utils/productSearch'

interface SearchFilterPayload {
  filters?: SearchFilter[]
  search?: string
  advancedSearch?: string[]
  type?: SearchOptionType
  folderId?: string
  from: number
  size: number
  sort: string
}
interface SearchPayloadCustom {
  search?: string
  bulk_search?: string
  sku?: string
}
export const searchFilter = async ({
  payload: props,
  user,
  roleVisibility,
}: UserVisibilityPayload<SearchFilterPayload>): Promise<{
  filteredCollections: Collection[]
  totalItems: number
}> => {
  const accessAndFilterPayload = getAccessAndFilterPayload({
    user,
    roleVisibility,
  })

  const searchPayload: SearchPayloadCustom = {}

  // Handle normal search
  if (props.search) {
    searchPayload.search = props.search
  }

  // Handle advanced search
  if (props.advancedSearch) {
    let advancedSearch = props.advancedSearch.join(' ')

    if (props.type === 'exact') {
      searchPayload.bulk_search = props.advancedSearch.join(' ')
      advancedSearch = `"${props.advancedSearch.join(' ')}"`
    } else {
      searchPayload.sku = props.advancedSearch.join(' ')
      advancedSearch = props.advancedSearch
        .map((word) => `(${word})`)
        .join(' OR ')
    }

    // Combine normal and advanced search if both are present
    if (props.search) {
      searchPayload.search = `${searchPayload.search} ${advancedSearch}`
    } else {
      searchPayload.search = advancedSearch
    }
  }

  const payload: SearchPayload = {
    ...accessAndFilterPayload,
    advanced: 'false', // TODO: figure out what the heck this is used for
    from: props.from,
    size: props.size,
    id: props.folderId || '',
    sort: props.sort,
    type: ['category', 'topic'],
    ...(props.filters
      ? {
          attributes: props.filters.map((attribute) => ({
            attribute_id: attribute.attribute?.id || '',
            attribute_name: attribute.attribute?.name || '',
            condition: attribute.condition || 'is',
            value: attribute.value || '',
            value_type: 'Text',
          })),
        }
      : {}),
    ...searchPayload,
  }
  const response = await advancedSearch(payload)

  return {
    filteredCollections: getSourceFromSearchHit(response),
    totalItems: response.total as number,
  }
}

export interface GetAttributesProps {
  search?: string
  page: number
  start: number
  end: number
}
export const getAttributes = async ({
  search,
  page,
  start,
  end,
}: GetAttributesProps): Promise<{
  options: SearchAttribute[]
  total: number
}> => {
  const payload: SearchAttributePayload = {
    currentPage: page,
    global_settings: false,
    limit: end,
    rowsPerPage: end,
    sort_column: 'label',
    sort_direction: 'asc',
    start,
    ...(search ? { search } : {}),
  }
  const response = await searchAttribute(payload)

  return {
    options: response.data.map((d) => ({ id: d.id, name: d.label })),
    total: response.count,
  }
}

export const getSearchItemState = (searchParams?: Record<string, string>) => {
  return {
    type: searchParams?.option
      ? (JSON.parse(searchParams.option) as SearchOptionType)
      : 'exact',
    search: searchParams?.search,
    advancedSearch: searchParams?.advancedSearch
      ? (JSON.parse(searchParams.advancedSearch) as string[])
      : undefined,
    filters: searchParams?.attributes
      ? (JSON.parse(searchParams.attributes) as SearchFilter[])
      : undefined,
    folderId: searchParams?.folderId
      ? (JSON.parse(searchParams.folderId) as string)
      : undefined,
    sort: searchParams?.sort
      ? (JSON.parse(searchParams.sort) as string)
      : undefined,
    page: searchParams?.page
      ? (JSON.parse(searchParams.page) as string)
      : undefined,
    perPage: searchParams?.perPage
      ? (JSON.parse(searchParams.perPage) as string)
      : undefined,
  }
}
