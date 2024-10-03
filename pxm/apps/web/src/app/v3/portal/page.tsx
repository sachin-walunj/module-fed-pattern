import { NextPage } from 'next'

import { CategoryHierarchyResponse } from '@amplifi-workspace/home'
import { FolderDetailsView, Home } from '@amplifi-workspace/home'
import {
  getSearchItemState,
  searchFilter,
} from '@amplifi-workspace/home/server'

import { getCategoryHierarchy } from '../../../server/actions'
import { getConfigState, getSession } from '../../../server/actions'

const Page: NextPage<{
  searchParams: {
    folderId?: string
    type?: string
    search?: string
    advancedSearch?: string
    option?: string
    filters?: string
    sort?: string
    page?: string
    perPage?: string
  }
}> = async ({ searchParams }) => {
  const sessionData = await getSession()
  const configData = await getConfigState()
  const {
    type,
    search,
    advancedSearch,
    filters,
    folderId,
    sort,
    page,
    perPage,
  } = getSearchItemState(searchParams)

  const hasSearchParams = Object.keys(searchParams ?? {}).length > 0

  let collections, items
  let categoryHierarchy: CategoryHierarchyResponse | null = null

  if (hasSearchParams) {
    const { filteredCollections, totalItems } = await searchFilter({
      payload: {
        folderId,
        type,
        search,
        advancedSearch,
        filters,
        from: (Number(page) - 1) * Number(perPage),
        size: perPage ? Number(perPage) : 25,
        sort: sort ?? 'alphabetical',
      },
      user: sessionData,
      roleVisibility: configData.role_visibility,
    })
    collections = filteredCollections
    items = totalItems
  }

  // Fetch category hierarchy if folderId is available
  categoryHierarchy = folderId ? await getCategoryHierarchy(folderId) : null

  return hasSearchParams ? (
    <FolderDetailsView
      collections={collections ?? []}
      totalItems={items ?? 0}
      categoryHierarchy={categoryHierarchy}
    />
  ) : (
    <Home />
  )
}

export default Page
