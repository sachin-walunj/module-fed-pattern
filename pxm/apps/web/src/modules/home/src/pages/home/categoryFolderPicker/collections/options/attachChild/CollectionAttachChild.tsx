import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Button,
  FormFooter,
  SearchBar,
  SideDrawer,
  StandardTable,
} from '@patterninc/react-ui'

import { useAppSelector } from '@amplifi-workspace/store'
import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { useFilter } from './Filter'
import {
  BrowseTreeItem,
  ItemType,
} from '../../../../../../_common/types/collectionTypes'
import { AssignToNodePayload } from '../../../../../../server/actions'
import { useCollectionRouter } from '../../../../_common/hooks/CollectionRouter'
import styles from '../../collections.module.scss'
import { useCollectionItems } from '../../CollectionTreeItem'
import { fetchTopicItems } from '../../DataLayer'
import { CollectionFolderTypePicker } from '../CollectionFolderTypePicker'

interface CollectionAttachChildProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: AssignToNodePayload) => void
  item: BrowseTreeItem
}
export const CollectionAttachChild: React.FC<CollectionAttachChildProps> = ({
  isOpen,
  onClose,
  onSave: onSaveProps,
  item,
}) => {
  const { t } = useTranslate('portal')
  const [folderType, setFolderType] = useState<ItemType>('category')
  const onSave = () => {
    onSaveProps({
      data: {
        ids: selectedItems.map((item) => item.id),
        parent_id: item.id,
      },
      type: folderType,
    })
    onClose()
  }
  const [selectedItems, setSelectedItems] = useState<BrowseTreeItem[]>([])

  return (
    <SideDrawer
      isOpen={isOpen}
      closeCallout={onClose}
      headerContent={t('attachSubFolder')}
      footerContent={
        <FormFooter
          cancelButtonProps={{ onClick: onClose }}
          saveButtonProps={{ onClick: onSave, styleType: 'primary-blue' }}
        />
      }
      layerPosition={1}
    >
      <CollectionAttachChildContents
        setSelectedItems={setSelectedItems}
        folderType={folderType}
        setFolderType={setFolderType}
        onClose={onClose}
        item={item}
      />
    </SideDrawer>
  )
}

interface CollectionAttachChildContentsProps {
  setSelectedItems: (items: BrowseTreeItem[]) => void
  folderType: ItemType
  setFolderType: (type: ItemType) => void
  item: BrowseTreeItem
  onClose: () => void
}
const CollectionAttachChildContents: React.FC<
  CollectionAttachChildContentsProps
> = ({ onClose, item, setSelectedItems, folderType, setFolderType }) => {
  const { t } = useTranslate('portal')
  const [search, setSearch] = useState('')
  const { items, hasMore, getData } = useItems({ type: folderType, search })
  const {
    sort,
    sortBy,
    items: filteredItems,
  } = useFilter({ items: items || [], currentItem: item, search })
  const { routeToCollection } = useCollectionRouter()

  const handleCheckboxes = (items: BrowseTreeItem[]) => {
    setSelectedItems(items)
  }

  const onView = (item: BrowseTreeItem) => {
    routeToCollection(item)
    onClose()
  }

  return (
    <>
      <CollectionFolderTypePicker
        value={folderType}
        callout={(param) => setFolderType(param)}
      />
      <div className={styles.createFormContainer}>
        <SearchBar value={search} onChange={setSearch} />
        <StandardTable
          config={[
            {
              name: 'name',
              label: c('name'),
              mainColumn: true,
              cell: {
                children: (item) => item.name,
              },
            },
            {
              name: 'view',
              label: '',
              isButton: true,
              noSort: true,
              cell: {
                children: (item) => (
                  <Button onClick={() => onView(item)}>View</Button>
                ),
              },
            },
          ]}
          data={filteredItems}
          dataKey='name'
          customWidth={400}
          getData={getData}
          hasData
          hasMore={hasMore}
          hasCheckboxes
          loading={false}
          noDataFields={{
            primaryText: t('noDataAvailable'),
            secondaryText: t(
              'thereHasBeenAProblemWithTheDataFilePleaseRestartYourComputer'
            ),
          }}
          successStatus
          tableId='unique_table_string'
          sort={sort}
          sortBy={sortBy}
          handleCheckedBoxes={handleCheckboxes}
        />
      </div>
    </>
  )
}

//Handles which items are displayed in the table depending on the type
const useItems = ({ type, search }: { type: ItemType; search: string }) => {
  const { collectionItems } = useCollectionItems()
  const {
    hasMore: topicHasMore,
    items: topicItems,
    getData: topicGetData,
  } = useTopicItems(search)
  const items = useMemo(() => {
    if (type === 'category') {
      return collectionItems.filter((item) => item.type === 'category')
    }

    return topicItems
  }, [collectionItems, type, topicItems])

  const hasMore = useMemo(
    () => (type === 'category' ? false : topicHasMore),
    [type, topicHasMore]
  )
  const getData = useMemo(
    () => (type === 'category' ? () => null : topicGetData),
    [type, topicGetData]
  )

  return { items, hasMore, getData }
}

//Handles fetching and pagination of topic items
const useTopicItems = (search: string) => {
  const user = useAppSelector((state) => state.user)
  const config = useAppSelector((state) => state.config)
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<BrowseTreeItem[]>([])
  const [total, setTotal] = useState(items.length)

  const hasMore = useMemo(() => items.length < total, [items, total])

  const fetchItems = useCallback(async () => {
    const limit = 50
    const { items, total } = await fetchTopicItems({
      payload: { search, start: (page - 1) * limit, end: page * limit },
      user,
      roleVisibility: config.role_visibility,
    })

    setItems((prevItems) => [
      ...prevItems,
      //Filter out the items that are already in the list
      ...items
        .filter((item) => !prevItems.find((prev) => prev.id === item.id))
        .map((item) => ({ ...item, children: [] })),
    ])
    total !== undefined && setTotal(total)
    setPage(page + 1)
  }, [config.role_visibility, page, search, user])

  const getData = useCallback(() => {
    fetchItems()
  }, [fetchItems])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return { items, hasMore, getData }
}
