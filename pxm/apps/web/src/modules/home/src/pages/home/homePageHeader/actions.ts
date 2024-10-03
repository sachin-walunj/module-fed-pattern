'use server'

import { SearchHitsMetadata } from '@elastic/elasticsearch/lib/api/types'

import { Fetcher } from '@amplifi-workspace/static-shared'

import { Collection, Media } from '../../../_common/types/collectionTypes'
import { ProductSearchPayload } from '../../../server/actions'
import {
  getAccessAndFilterPayload,
  UserVisibilityPayload,
} from '../../../utils/actions'

export interface AutocompletePayload {
  search: string
  parentCategory: string | undefined
}
type AutocompleteRequest = ProductSearchPayload
interface AutocompleteBucket<T> {
  doc_count: number
  top: {
    hits: SearchHitsMetadata<T>
  }
}
interface AutocompleteResponse {
  aggregations: {
    autocomplete: {
      buckets: {
        browse_category: AutocompleteBucket<Collection>
        media: AutocompleteBucket<Media>
        topics: AutocompleteBucket<Collection>
      }
    }
  }
}

export async function searchAutocomplete({
  payload: { search, parentCategory },
  user,
  roleVisibility,
}: UserVisibilityPayload<AutocompletePayload>): Promise<AutocompleteResponse> {
  const filterAndAccess = getAccessAndFilterPayload({
    user,
    filterOverride: {
      terms: {
        ...(parentCategory
          ? {
              parent_category:
                parentCategory === 'folder'
                  ? ['category', 'topic']
                  : [parentCategory],
            }
          : undefined),
      },
    },
    roleVisibility,
  })
  const request: AutocompleteRequest = {
    search,
    ...filterAndAccess,
  }
  const response = await Fetcher<AutocompleteResponse>({
    url: `/product/autocomplete`,
    method: 'POST',
    payload: request,
  })

  return response
}
