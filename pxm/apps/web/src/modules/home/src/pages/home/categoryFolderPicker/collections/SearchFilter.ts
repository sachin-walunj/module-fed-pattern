import { useEffect, useMemo, useState } from 'react'

import { usePrevious } from '@patterninc/react-ui'

import { useAppSelector } from '@amplifi-workspace/store'

import {
  collectionToTree,
  CollectionTreeItemLike,
  shouldShowOptions,
  useCollectionItems,
} from './CollectionTreeItem'
import { CollectionTreeItem } from './types'
import { BrowseTreeItem } from '../../../../_common/types/collectionTypes'
import { searchCategoryTree } from '../../../../server/actions'
import { getActiveRegions } from '../../../../utils/actions'

interface SearchFilterProps {
  items: CollectionTreeItem[]
}
interface SearchFilterResult {
  items: CollectionTreeItem[]
  search: string
  onSearch: (value: string) => void
  loading: boolean
}
export const useSearchFilter = ({
  items,
}: SearchFilterProps): SearchFilterResult => {
  const { addItems } = useCollectionItems()
  const user = useAppSelector((state) => state.user)
  const roleVisibility = useAppSelector((state) => state.config).role_visibility
  const [loading, setLoading] = useState(false)

  //These are items that were returned from the search that weren't able to be merged into the tree
  //because they don't have a parent that is currently in the tree
  const [notMergedItems, setNotMergedItems] = useState<BrowseTreeItem[]>([])

  type CollectionTreeItemWithParent = Omit<CollectionTreeItem, 'children'> & {
    parent: CollectionTreeItemWithParent | undefined
    children: CollectionTreeItemWithParent[]
  }
  const [search, setSearch] = useState('')
  const previousSearch = usePrevious(search) as string

  const itemsWithParent = useMemo(() => {
    const connectParentToChild = (
      parent: CollectionTreeItemWithParent | undefined,
      child: CollectionTreeItem
    ): CollectionTreeItemWithParent => {
      const newChild: CollectionTreeItemWithParent = {
        ...child,
        children: [],
        parent,
      }
      newChild.children = child.children.map((grandchild) =>
        connectParentToChild(newChild, grandchild)
      )
      return newChild
    }

    return items.map((item) => connectParentToChild(undefined, item))
  }, [items])

  const filteredItems = useMemo(() => {
    if (!search) return itemsWithParent.slice()

    const copyItem = (
      item: CollectionTreeItemWithParent,
      parent?: CollectionTreeItemWithParent | undefined
    ): CollectionTreeItemWithParent => {
      const copy: CollectionTreeItemWithParent = {
        ...item,
        parent,
        children: [],
      }
      copy.children = item.children.map((child) => copyItem(child, copy))

      return copy
    }
    const copy = itemsWithParent.map((item) => copyItem(item))
    //Push the search items that weren't able to be merged into the tree
    copy.push(
      ...notMergedItems.map((item) =>
        collectionToTree<CollectionTreeItemWithParent>(item, {
          showOptions: shouldShowOptions(user),
          showTopics: true,
          map: (
            item: CollectionTreeItemLike<CollectionTreeItemWithParent>
          ) => ({ ...item, parent: undefined }),
        })
      )
    )

    const isValidLabel = (label: string): boolean => {
      return label.toLowerCase().includes(search.toLowerCase())
    }

    const pruneTree = (
      item: CollectionTreeItemWithParent
    ): CollectionTreeItemWithParent | undefined => {
      const validChildren = item.children
        .map(pruneTree)
        .filter(
          (child) => child !== undefined
        ) as CollectionTreeItemWithParent[]
      if (!isValidLabel(item.label) && validChildren.length === 0) {
        return undefined
      }

      return {
        ...item,
        children: validChildren,
        highlightLabel: search,
        isOpen: validChildren.length > 0,
      }
    }

    const findCommonAncestor = (
      children: CollectionTreeItemWithParent[],
      parent?: CollectionTreeItemWithParent
    ): CollectionTreeItemWithParent | undefined => {
      if (children.length === 1 && children[0].children.length > 0) {
        return findCommonAncestor(children[0].children, children[0])
      }

      return parent
    }

    const prunedTree = copy
      .map(pruneTree)
      .filter((item) => item !== undefined) as CollectionTreeItemWithParent[]

    const commonAncestor = findCommonAncestor(prunedTree)

    return commonAncestor ? commonAncestor.children : prunedTree
  }, [search, itemsWithParent, notMergedItems, user])

  //Make new cache with search items
  useEffect(() => {
    const makeSearchCall = async () => {
      setLoading(true)
      const searchItems = await searchCategoryTree({
        user,
        roleVisibility,
        payload: {
          keyword: search,
          region: getActiveRegions(user),
        },
      })

      const { notMergedItems } = addItems(
        searchItems.map((item) => ({ ...item, children: [] }))
      )
      setNotMergedItems(notMergedItems)
      setLoading(false)
    }
    if (search && search !== previousSearch) {
      makeSearchCall()
    }
  }, [search, previousSearch, addItems, roleVisibility, user])

  return { items: filteredItems, search, onSearch: setSearch, loading }
}
