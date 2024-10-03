import { useCallback, useMemo } from 'react'

import { IUserState, useAppSelector } from '@amplifi-workspace/store'

import { useCollectionsContext } from './CollectionsProvider'
import { fetchCollectionItems } from './DataLayer'
import { CollectionOptionsButton } from './options/CollectionOptionsButton'
import { CollectionTreeItem } from './types'
import { BrowseTreeItem } from '../../../../_common/types/collectionTypes'
import { findItemWithId, TreeLike } from '../folder-tree/utils'

const collectionTypeToIconMap = {
  unassociated: 'folder',
  category: 'folder',
  topic: 'document',
} as const

interface CollectionTreeItemOptions {
  onItemClick?: (item: BrowseTreeItem) => void
  showTopics: boolean
}
export const useCollectionTreeItem = ({
  onItemClick,
  showTopics,
}: CollectionTreeItemOptions): CollectionTreeItem[] => {
  const user = useAppSelector((state) => state.user)
  const { fetchItem, cachedCollectionItems } = useCachedCollectionItems()
  const showOptions = useMemo(() => shouldShowOptions(user), [user])

  const onCollectionItemClick = useCallback(
    async (item: BrowseTreeItem): Promise<void> => {
      if (item.type === 'category') {
        await fetchItem(item)
      }

      onItemClick?.(item)
    },
    [fetchItem, onItemClick]
  )

  /** Make api call or pass in items to props */
  const collectionTreeItems = useMemo(
    () =>
      cachedCollectionItems?.map((item) =>
        collectionToTree(item, {
          showOptions,
          showTopics,
          onCollectionItemClick,
        })
      ) || [],
    [cachedCollectionItems, showOptions, showTopics, onCollectionItemClick]
  )

  return collectionTreeItems
}

// A type that has at least the properties of CollectionTreeItem, possibly more
export type CollectionTreeItemLike<
  T extends CollectionTreeItemLike<T> = CollectionTreeItem
> = TreeLike<T> & Omit<CollectionTreeItem, 'children'>

/**
 * Converts a BrowseTreeItem to a CollectionTreeItemLike type.
 * The map function is used to add on properties to CollectionTreeItem, resulting in the CollectionTreeItemLike type.
 */
export function collectionToTree(
  item: BrowseTreeItem,
  options: {
    showTopics: boolean
    onCollectionItemClick?: (item: BrowseTreeItem) => Promise<void>
    showOptions: boolean
  }
): CollectionTreeItem
export function collectionToTree<T extends CollectionTreeItemLike<T>>(
  item: BrowseTreeItem,
  options: {
    showTopics: boolean
    onCollectionItemClick?: (item: BrowseTreeItem) => Promise<void>
    showOptions: boolean
    map: (item: CollectionTreeItemLike<T>) => T
  }
): T
export function collectionToTree<T extends CollectionTreeItemLike<T>>(
  item: BrowseTreeItem,
  options: {
    showTopics: boolean
    onCollectionItemClick?: (item: BrowseTreeItem) => Promise<void>
    showOptions: boolean
    map?: (item: CollectionTreeItemLike<T>) => T
  }
): CollectionTreeItem | T {
  const map = options.map || ((item) => item)
  return map({
    id: item.id,
    label: item.name,
    type: collectionTypeToIconMap[item.type],
    children: item.children
      .map((child) =>
        //Don't show the topic child if we are not supposed to show topics
        !options.showTopics && child.type === 'topic'
          ? undefined
          : collectionToTree(child, options)
      )
      .filter((child): child is T => child !== undefined),
    data: item,
    onClick: options.onCollectionItemClick,
    optionsContent: options.showOptions ? CollectionOptionsButton : undefined,
  })
}

export const shouldShowOptions = (user: IUserState): boolean =>
  ['admin', 'superadmin'].includes(user?.role)

export const useCollectionItems = () => {
  const {
    mergeCacheItems: addItems,
    deleteCacheItem: deleteItem,
    moveCacheItems: moveItems,
    fetchItem,
  } = useCachedCollectionItems()
  const { collectionItems } = useCollectionsContext()

  return { collectionItems, addItems, deleteItem, moveItems, fetchItem }
}

/** Handles calling the category items from the server and updating the cached list */
const useCachedCollectionItems = () => {
  const user = useAppSelector((state) => state.user)
  const config = useAppSelector((state) => state.config)
  const {
    collectionItems: cachedCollectionItems,
    setCollectionItems: setCachedCollectionItems,
    fetchedItems,
    setFetchedItems,
  } = useCollectionsContext()

  //Adds the items to the list and sorts it alphabetically
  const addToCollectionList = (
    list: BrowseTreeItem[],
    items: BrowseTreeItem[]
  ) => {
    //Only add unique items
    items.forEach((item) => {
      if (!list.find((i) => i.id === item.id)) list.push(item)
    })
    list.sort((a, b) => {
      if (a.type === 'unassociated') return -1
      if (b.type === 'unassociated') return 1

      return a.name.localeCompare(b.name)
    })
  }

  const mergeCacheItems = useCallback(
    (newItems: BrowseTreeItem[]): { notMergedItems: BrowseTreeItem[] } => {
      if (cachedCollectionItems === undefined) return { notMergedItems: [] }

      const copy = cachedCollectionItems.slice()
      const groupByParentId = newItems.reduce<Record<string, BrowseTreeItem[]>>(
        (prev, curr) => {
          const parents =
            curr.direct_parent && curr.direct_parent.length > 0
              ? curr.direct_parent
              : [curr.parent_id || '']
          for (const parent_id of parents) {
            const groupKey = parent_id || ''
            //Initialize group if it doesn't exist yet
            if (!prev[groupKey]) {
              prev[groupKey] = []
            }

            //Put item into parent group
            const parentGroup = prev[groupKey]
            parentGroup.push(curr)
          }

          return prev
        },
        {}
      )

      const notMergedItems: BrowseTreeItem[] = []
      for (const parentId in groupByParentId) {
        if (parentId === 'unassociated') continue
        const groupedItems = groupByParentId[parentId]

        if (parentId === '') {
          addToCollectionList(copy, groupedItems)
          continue
        }

        const foundItem = findItemWithId(parentId, copy)
        if (!foundItem) {
          notMergedItems.push(...groupedItems)
          continue
        }

        addToCollectionList(foundItem.children, groupedItems)
      }

      setCachedCollectionItems(copy)
      return { notMergedItems }
    },
    [cachedCollectionItems, setCachedCollectionItems]
  )

  const deleteCacheItem = useCallback(
    (id: string, parentId: string) => {
      if (cachedCollectionItems === undefined) return

      const copy = cachedCollectionItems.slice()
      const parentItem = findItemWithId(parentId, copy)
      const deleteItemContainer = parentItem?.children || copy

      const deleteItemIndex = deleteItemContainer.findIndex(
        (item) => item.id === id
      )
      if (deleteItemIndex < 0) return

      deleteItemContainer.splice(deleteItemIndex, 1)
      setCachedCollectionItems(copy)
    },
    [cachedCollectionItems, setCachedCollectionItems]
  )

  const moveCacheItems = useCallback(
    (ids: string[], newParentId: string) => {
      if (cachedCollectionItems === undefined) return

      const copy = cachedCollectionItems.slice()
      const newParentItem = findItemWithId(newParentId, copy)
      if (!newParentItem) return

      for (const id of ids) {
        const item = findItemWithId(id, copy)
        if (!item) return

        const parentItem = findItemWithId(item?.parent_id || '', copy)

        //If this item's parent item is undefined then that means it is a root item
        const parentContainer = parentItem?.children || copy

        const itemIndex = parentContainer.findIndex((child) => child.id === id)
        if (itemIndex < 0) return

        parentContainer.splice(itemIndex, 1)
        addToCollectionList(newParentItem.children, [item])
      }
      setCachedCollectionItems(copy)
    },
    [cachedCollectionItems, setCachedCollectionItems]
  )

  const fetchItem = useCallback(
    async (item: BrowseTreeItem, force = false): Promise<void> => {
      const fetch = async () => {
        const items = await fetchCollectionItems({
          payload: {
            name: item.name,
            parent_id: item.id,
          },
          user,
          roleVisibility: config.role_visibility,
        })
        mergeCacheItems(items)
        setFetchedItems((values) => [...values, item.id])
      }

      if (force || !fetchedItems.includes(item.id)) {
        await fetch()
      }
    },
    [
      fetchedItems,
      user,
      config.role_visibility,
      mergeCacheItems,
      setFetchedItems,
    ]
  )

  return {
    fetchItem,
    cachedCollectionItems,
    mergeCacheItems,
    deleteCacheItem,
    moveCacheItems,
  }
}
