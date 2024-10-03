import { useState } from 'react'

import { Menu } from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { CollectionAttachChild } from './attachChild/CollectionAttachChild'
import { CollectionCreateFolder } from './createFolder/CollectionCreateFolder'
import {
  BrowseTreeItem,
  ItemType,
} from '../../../../../_common/types/collectionTypes'
import { AssignToNodePayload } from '../../../../../server/actions'
import { useCollectionRouter } from '../../../_common/hooks/CollectionRouter'
import { FolderItemOptionsComponent } from '../../folder-tree/types'
import { useCollectionItems } from '../CollectionTreeItem'
import {
  assignToCategoryOrTopic,
  createNewCategoryOrTopic,
  deleteCategoryOrTopic,
  NewCategoryData,
} from '../DataLayer'

type CalloutType = 'create' | 'attach' | 'edit'
export const CollectionOptionsButton: FolderItemOptionsComponent<
  BrowseTreeItem
> = ({ item, onClose }) => {
  const { t } = useTranslate('portal')
  const [selectedCallout, setSelectedCallout] = useState<
    CalloutType | undefined
  >()
  const { routeToCollection } = useCollectionRouter()
  const { deleteItem, addItems, fetchItem, moveItems } = useCollectionItems()

  const closeCallout = (): void => {
    setSelectedCallout(undefined)
  }

  const onCreate = async (data: NewCategoryData, type: ItemType) => {
    const newItem = await createNewCategoryOrTopic(data, type)
    addItems([newItem])
  }

  const onDeleteItem = async () => {
    const result = await deleteCategoryOrTopic(item.id, item.type)
    if (result) {
      deleteItem(item.id, item.parent_id || '')
    }
  }

  const onAttach = async (payload: AssignToNodePayload) => {
    const result = await assignToCategoryOrTopic(payload)

    if (result) {
      await fetchItem(item, true)
      //Won't move the items correctly without a set timeout due to
      //two set states happening in this thread
      setTimeout(() => moveItems(payload.data.ids, item.id))
    }
  }

  return (
    <>
      <Menu
        actions={[
          {
            callout: () => {
              setSelectedCallout('create')
              onClose()
            },
            icon: 'plus',
            text: t('newFolder'),
          },
          {
            callout: () => {
              setSelectedCallout('attach')
              onClose()
            },
            icon: 'paperClip',
            text: t('attachSubFolder'),
          },
          {
            callout: () => {
              routeToCollection(item)
              onClose()
            },
            icon: 'pencil',
            text: t('editFolder'),
          },
          {
            icon: 'trash',
            text: t('deleteFolder'),
            hasDivider: true,
            destructive: true,
            confirmation: {
              type: 'red',
              confirmCallout: () => {
                onDeleteItem()
                onClose()
              },
              header: t('deleteFolder'),
              body: t('thisFolderWillBeDeletedThisActionCannotBeUndone'),
              confirmButtonText: c('confirmDelete'),
            },
          },
        ]}
      />
      <CollectionCreateFolder
        isOpen={selectedCallout === 'create'}
        onClose={closeCallout}
        onSave={onCreate}
        item={item}
      />
      <CollectionAttachChild
        isOpen={selectedCallout === 'attach'}
        onClose={closeCallout}
        onSave={onAttach}
        item={item}
      />
    </>
  )
}
