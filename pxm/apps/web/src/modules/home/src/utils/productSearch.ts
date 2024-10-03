import { SearchHitsMetadata } from '@elastic/elasticsearch/lib/api/types'

export function getSourceFromSearchHit<T>(result: SearchHitsMetadata<T>): T[] {
  return result.hits
    .map((hit) => hit._source)
    .filter((item) => item !== undefined) as T[]
}
