'use client'
import { useState } from 'react'

import { Button, SideDrawer } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import { useCollectionItems } from './CollectionTreeItem'
import { CollectionTreeView } from './CollectionTreeView'
import { createNewCategoryOrTopic, NewCategoryData } from './DataLayer'
import { CollectionCreateFolder } from './options/createFolder/CollectionCreateFolder'
import {
  BrowseTreeItem,
  ItemType,
} from '../../../../_common/types/collectionTypes'
import { useCollectionRouter } from '../../_common/hooks/CollectionRouter'

import styles from './collections.module.scss'

interface CollectionsSideDrawerProps {
  isOpen: boolean
  onClose: () => void
}
const CollectionsSideDrawer: React.FC<CollectionsSideDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslate('portal')
  const { routeToCollection } = useCollectionRouter()
  const { addItems } = useCollectionItems()
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false)

  const onItemClick = (item: BrowseTreeItem): void => {
    routeToCollection(item)
    if (item.type === 'topic' || item.type === 'unassociated') {
      onClose()
    }
  }

  const onNewFolder = (): void => {
    setIsNewFolderOpen(true)
  }

  const onCreate = async (data: NewCategoryData, type: ItemType) => {
    const newItem = await createNewCategoryOrTopic(data, type)
    addItems([newItem])
  }

  return (
    <SideDrawer
      headerContent={t('categories')}
      isOpen={isOpen}
      closeCallout={onClose}
      contentClassName={styles.sideDrawerContent}
      noContentPadding={true}
      footerContent={
        <>
          <div className={styles.sideDrawerFooter}>
            <Button styleType='primary-blue' onClick={onNewFolder}>
              {t('newFolder')}
            </Button>
          </div>
          <CollectionCreateFolder
            isOpen={isNewFolderOpen}
            onSave={onCreate}
            onClose={() => setIsNewFolderOpen(false)}
          />
        </>
      }
    >
      <CollectionTreeView onItemClick={onItemClick} />
    </SideDrawer>
  )
}

export default CollectionsSideDrawer
