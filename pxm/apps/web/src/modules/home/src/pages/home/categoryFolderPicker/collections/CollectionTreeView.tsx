'use client'

import { useEffect, useMemo, useState } from 'react'

import { SearchBar, usePrevious } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import { CollectionLoading } from './CollectionLoading'
import { useCollectionTreeItem } from './CollectionTreeItem'
import { useSearchFilter } from './SearchFilter'
import { CollectionTreeItem } from './types'
import { BrowseTreeItem } from '../../../../_common/types/collectionTypes'
import { FolderTree } from '../folder-tree/FolderTree'
import { findItemWithId, manipulateTreeItem } from '../folder-tree/utils'

import styles from './collections.module.scss'

interface CollectionTreeViewProps {
  selectedItem?: BrowseTreeItem
  onItemClick: (item: BrowseTreeItem) => void
  showTopics?: boolean
  checkedItems?: BrowseTreeItem[]
  setCheckedItems?: React.Dispatch<React.SetStateAction<BrowseTreeItem[]>>
  parent?: string
}
export const CollectionTreeView: React.FC<CollectionTreeViewProps> = ({
  onItemClick,
  selectedItem,
  showTopics = true,
  checkedItems,
  setCheckedItems,
  parent,
}) => {
  const { t } = useTranslate('portal')
  let items = useCollectionTreeItem({ onItemClick, showTopics })
  if (parent === 'Unassociated Listings') {
    items = items.filter((item) => item.id !== 'listing')
  }
  const openedItems = useOpenSelectedItem(items, selectedItem)
  const {
    search,
    onSearch,
    items: filtered,
    loading,
  } = useSearchFilter({ items: openedItems })
  const [selected, setSelected] = useState('')
  const previousSelectedItem = usePrevious(selectedItem) as
    | BrowseTreeItem
    | undefined

  useEffect(() => {
    if (selectedItem && previousSelectedItem?.id !== selectedItem.id) {
      setSelected(selectedItem.id)
    }
  }, [selectedItem, previousSelectedItem, setSelected])

  return (
    <>
      <div className={styles.sideDrawerPadding}>
        <SearchBar value={search} onChange={onSearch} />
      </div>
      {items === undefined || loading ? (
        <div className={styles.sideDrawerPadding}>
          <CollectionLoading />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>{t('noResults')}</div>
      ) : (
        <FolderTree
          items={filtered}
          selectedItem={selected}
          onSelect={setSelected}
          checkedItems={checkedItems}
          setCheckedItems={setCheckedItems}
        />
      )}
    </>
  )
}

/** Opens the selected item or any parents of the selected item */
const useOpenSelectedItem = (
  items: CollectionTreeItem[],
  selectedItem?: BrowseTreeItem
): CollectionTreeItem[] => {
  const openedItems = useMemo(() => {
    if (selectedItem) {
      return manipulateTreeItem(items, (item) => {
        const isChildOrSelfSelected =
          item.id === selectedItem.id ||
          Boolean(findItemWithId(selectedItem.id, item.children))
        if (isChildOrSelfSelected) {
          item.isOpen = true
        }

        return item
      })
    } else {
      return items
    }
  }, [items, selectedItem])

  return openedItems
}
