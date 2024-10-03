import { useEffect, useMemo, useState } from 'react'

import { usePrevious } from '@patterninc/react-ui'

import { BrowseTreeItem } from '../../../../../../_common/types/collectionTypes'

export const useFilter = ({
  items,
  currentItem,
  search,
}: {
  items: BrowseTreeItem[]
  currentItem: BrowseTreeItem
  search: string
}) => {
  const { data, sort, sortBy } = useSort(items)
  const { data: filteredItems } = useSearch({ items: data, search })

  const filteredItemsWithoutCurrentItem = useMemo(
    () => filteredItems.filter((item) => item.id !== currentItem.id),
    [filteredItems, currentItem]
  )

  const filteredWithoutUnassociated = useMemo(
    () =>
      filteredItemsWithoutCurrentItem.filter(
        (item) => item.type !== 'unassociated'
      ),
    [filteredItemsWithoutCurrentItem]
  )

  return {
    sort,
    sortBy,
    items: filteredWithoutUnassociated,
  }
}

const useSearch = ({
  items,
  search,
}: {
  items: BrowseTreeItem[]
  search: string
}) => {
  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search, items]
  )

  return {
    data: filteredItems,
  }
}

const useSort = (items: BrowseTreeItem[]) => {
  const [sortedItems, setSortedItems] = useState(items)
  const [sortBy, setSortBy] = useState<{ prop: string; flip: boolean }>({
    prop: 'name',
    flip: false,
  })

  const prevItems = usePrevious(items) as BrowseTreeItem[]

  // If the items change, reset the sorted items
  useEffect(() => {
    if (prevItems !== items) {
      setSortedItems(items)
    }
  }, [prevItems, items, setSortedItems])

  const sort = (sortObj: { activeColumn: string; direction: boolean }) => {
    const sortedData = [...items].sort((a, b) => {
      const aColumn = a[sortObj.activeColumn as 'name'].toLowerCase()
      const bColumn = b[sortObj.activeColumn as 'name'].toLowerCase()

      if (aColumn < bColumn) {
        return sortObj.direction ? -1 : 1
      }
      if (aColumn > bColumn) {
        return sortObj.direction ? 1 : -1
      }
      return 0
    })
    setSortedItems(sortedData)
    setSortBy({
      prop: sortObj.activeColumn,
      flip: sortObj.direction,
    })
  }

  return {
    data: sortedItems,
    sort,
    sortBy,
  }
}
