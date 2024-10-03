import moment from 'moment'

import {
  BrowseTreeItem,
  Collection,
  ItemType,
} from '../../../../_common/types/collectionTypes'
import {
  assignToNode,
  AssignToNodePayload,
  CategoryTreePayload,
  createNewCategory as createNewCategoryAction,
  createNewTopic,
  deleteCategory,
  deleteTopic,
  getCategoryTree,
  NewCategoryPayload,
  searchTopics,
  SearchTopicsPayload,
} from '../../../../server/actions'
import {
  getAccessAndFilterPayload,
  UserVisibilityPayload,
} from '../../../../utils/actions'
import { getSourceFromSearchHit } from '../../../../utils/productSearch'

export const fetchCollectionItems = async ({
  payload: props,
  user,
  roleVisibility,
}: UserVisibilityPayload<
  | {
      name: string
      parent_id: string
      title_id?: string
    }
  | undefined
>): Promise<BrowseTreeItem[]> => {
  const accessAndFilterPayload = getAccessAndFilterPayload({
    user,
    roleVisibility,
  })

  const payload: CategoryTreePayload = {
    name: props?.name,
    parent_id: props?.parent_id,
    ...accessAndFilterPayload,
    version: 'V3',
  }
  const response = await getCategoryTree(payload)

  return response
}

interface FetchTopicItemsPayload {
  search: string
  start: number
  end: number
}
export const fetchTopicItems = async ({
  payload: { search, start, end },
  user,
  roleVisibility,
}: UserVisibilityPayload<FetchTopicItemsPayload>): Promise<{
  items: Collection[]
  total: number
}> => {
  const accessAndFilterPayload = getAccessAndFilterPayload({
    user,
    roleVisibility,
  })

  const payload: SearchTopicsPayload = {
    key: 'search',
    type: ['topic'],
    search,
    size: end - start,
    from: start,
    ...accessAndFilterPayload,
  }
  const response = await searchTopics(payload)

  const items = getSourceFromSearchHit(response)

  return { items, total: response.total as number }
}

export interface NewCategoryData {
  name: string
  additional_title?: string
  isPublished: boolean
  publishedStartDate: moment.Moment | null
  publishedEndDate: moment.Moment | null
  regions: string[]
  parentCategory: string[]
  id: string
  parentId: string
  directParents: string[]
}
export const createNewCategoryOrTopic = async (
  props: NewCategoryData,
  type: ItemType
): Promise<BrowseTreeItem> => {
  const payload: Omit<NewCategoryPayload, 'parent_id'> = {
    attributes: [],
    direct_parent: type === 'topic' ? props.directParents : [],
    inherit_parent: false,
    name: props.name,
    parent_category: props.parentCategory,
    published: props.isPublished,
    published_end_date:
      props.publishedEndDate?.startOf('day').toISOString() || '',
    published_start_date:
      props.publishedStartDate?.startOf('day').toISOString() || '',
    region_ids: props.regions,
    status: 'Active',
  }
  if (type === 'topic') {
    const response = await createNewTopic({
      ...payload,
      parent_id: props.id,
      additional_title: props.additional_title || '',
    })
    return {
      ...response,
      children: [],
      type: 'topic',
      db_id: response.id,
    }
  } else {
    const response = await createNewCategoryAction({
      ...payload,
      parent_id: props.parentId,
    })
    return {
      ...response,
      children: [],
      type: 'category',
      db_id: response.id,
    }
  }
}

export const deleteCategoryOrTopic = (
  id: string,
  type: ItemType
): Promise<boolean> => {
  if (type === 'category' || type === 'unassociated') {
    return deleteCategory(id)
  }

  return deleteTopic(id)
}

export const assignToCategoryOrTopic = async (
  payload: AssignToNodePayload
): Promise<boolean> => {
  const result = await assignToNode(payload)

  return result
}
