import {
  QueryDslBoolQuery,
  QueryDslQueryContainer,
  QueryDslRangeQuery,
} from '@elastic/elasticsearch/lib/api/types'
import moment from 'moment'

import { IUserState, RoleVisibility } from '@amplifi-workspace/store'

export interface AccessAndFilter {
  access: {
    empty_category_hierarchy: boolean
    empty_category_result: boolean
    empty_topic: boolean
  }
  filter: QueryDslBoolQuery['filter']
  roles: string
}

type Region = IUserState['regions'][number]
export function getActiveRegions<Key extends keyof Region = 'rethinkdb_id'>(
  userData?: IUserState,
  key: Key = 'rethinkdb_id' as Key
): Region[Key][] {
  if (!userData) {
    return []
  }
  const { regions = [] } = userData
  return regions.filter((f) => f.active).map((m) => m[key])
}

export interface UserVisibilityPayload<T> {
  user: IUserState
  roleVisibility: RoleVisibility
  payload: T
}
interface AccessAndFilterOptions {
  filterOverride?: QueryDslQueryContainer
  user: IUserState
  roleVisibility: RoleVisibility
}
export function getAccessAndFilterPayload({
  user,
  filterOverride,
  roleVisibility,
}: AccessAndFilterOptions): AccessAndFilter {
  const { empty_category_result, empty_category_hierarchy, empty_topic } =
    roleVisibility

  const payload: AccessAndFilter = {
    filter: {
      ...(filterOverride ? filterOverride : {}),
      term: {
        roles: user?.role,
        ...(filterOverride?.term ? filterOverride.term : {}),
      },
      terms: {
        region: getActiveRegions(user),
        ...(filterOverride?.terms ? filterOverride.terms : {}),
      },
      range:
        user?.role === 'guser'
          ? {
              published: {
                date: moment(new Date()).toISOString(),
              } as QueryDslRangeQuery, // This type is not correct, but this is how old amplifi does it
            }
          : undefined,
      ...(filterOverride?.range ? filterOverride.range : {}),
    },
    roles: user?.role,
    access: {
      empty_category_result: empty_category_result.includes(user?.role),
      empty_category_hierarchy: empty_category_hierarchy.includes(user?.role),
      empty_topic: empty_topic.includes(user?.role),
    },
  }

  return payload
}
