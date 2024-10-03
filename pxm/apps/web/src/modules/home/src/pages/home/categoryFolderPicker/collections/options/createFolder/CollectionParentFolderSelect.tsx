import { useCallback, useEffect, useRef, useState } from 'react'

import {
  Button,
  FormFooter,
  FormLabel,
  notEmpty,
  SideDrawer,
  StandardTable,
  usePrevious,
} from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { BrowseTreeItem } from '../../../../../../_common/types/collectionTypes'
import styles from '../../collections.module.scss'
import { CollectionTreeView } from '../../CollectionTreeView'

interface CollectionParentFolderSelectProps {
  parentsValue: BrowseTreeItem[]
  callout: (newSelections: BrowseTreeItem[]) => void
  label?: string
  tooltip?: string
  required?: boolean
}
export const CollectionParentFolderSelect: React.FC<
  CollectionParentFolderSelectProps
> = ({ parentsValue, callout, label, tooltip, required = true }) => {
  const { t } = useTranslate('portal')
  const [isOpen, setIsOpen] = useState(false)
  const [tableHeight, setTableHeight] = useState(500)
  const headerRef = useRef<HTMLDivElement>(null)

  const onToggle = (): void => {
    setIsOpen(!isOpen)
  }

  const onSelect = (item: BrowseTreeItem): void => {
    callout([...parentsValue, item])
    onToggle()
  }

  const onItemRemove = (item: BrowseTreeItem): void => {
    const copy = parentsValue.slice()
    const index = copy.findIndex((parentItem) => parentItem.id === item.id)
    if (index >= 0) {
      copy.splice(index, 1)
      callout(copy)
    }
  }

  const adjustTableHeight = useCallback(() => {
    let tableHeight = 0
    const maxRows = 12, // max rows = 10 + 1 for total row + 1 for header
      rows = // gets sticky table parent element's children, which includes the header and rows
        headerRef.current?.parentElement?.parentElement?.parentElement
          ?.parentElement?.childNodes,
      numRows = Math.min(rows?.length || 0, maxRows) // table will show max 10 rows at a time, and if there are less than 10 rows, it will show all rows

    for (let i = 0; i < numRows; i++) {
      const row = rows?.[i] as HTMLDivElement
      const rowHeight = row.getBoundingClientRect().height
      tableHeight += rowHeight
    }

    rows && setTableHeight(tableHeight + 8) // 8px as a buffer
  }, [setTableHeight, headerRef])

  useEffect(() => {
    // wait for the data before calculating the table height
    setTimeout(adjustTableHeight)
  }, [adjustTableHeight, parentsValue])

  return (
    <>
      <div>
        <FormLabel
          label={notEmpty(label) ? label : t('parentFolder')}
          required={required === false ? false : true}
          tooltip={{
            tooltipContent: notEmpty(tooltip)
              ? tooltip
              : t('selectParentFoldersWhereCollectionWillBeAssigned'),
          }}
        />
        <div className={styles.parentFolderSelectContainer}>
          <div className={styles.parentFolderSelectLabel}>
            {parentsValue[0]?.name || t('noFoldersSelected')}
          </div>
          <Button onClick={onToggle}>Select Folder to apply</Button>
        </div>
      </div>
      {parentsValue.length > 1 && (
        <StandardTable
          config={[
            {
              name: 'name',
              label: c('name'),
              //This is just to track the table height
              columnHeaderSubContent: <div ref={headerRef} />,
              mainColumn: true,
              noSort: true,
              cell: {
                children: (data) => data.name,
              },
            },
            {
              name: 'remove',
              label: '',
              isButton: true,
              noSort: true,
              cell: {
                children: (data) => (
                  <Button onClick={() => onItemRemove(data)}>Remove</Button>
                ),
              },
            },
          ]}
          data={parentsValue}
          dataKey='name'
          getData={() => null}
          hasData
          customWidth={400}
          customHeight={tableHeight}
          noDataFields={{
            primaryText: t('noDataAvailable'),
            secondaryText: t(
              'thereHasBeenAProblemWithTheDataFilePleaseRestartYourComputer'
            ),
          }}
          successStatus
          tableId='unique_table_string'
          hasMore={false}
          sort={() => null}
          sortBy={{ flip: false, prop: 'random' }}
          loading={false}
        />
      )}
      <CollectionParentSelectSideDrawer
        isOpen={isOpen}
        onClose={onToggle}
        onSave={onSelect}
        /** Accessing zero index for now because in the future there might be the ability
         * to pass in an array of selected values
         */
        selectedItem={parentsValue[0]}
      />
    </>
  )
}

interface CollectionParentSelectSideDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: BrowseTreeItem) => void
  selectedItem?: BrowseTreeItem
  checkedItems?: BrowseTreeItem[]
  setCheckedItems?: React.Dispatch<React.SetStateAction<BrowseTreeItem[]>>
}
export const CollectionParentSelectSideDrawer: React.FC<
  CollectionParentSelectSideDrawerProps
> = ({
  isOpen,
  onClose: onCloseProps,
  onSave: onSaveProps,
  selectedItem: selectedItemProps,
  checkedItems,
  setCheckedItems,
}) => {
  const { t } = useTranslate('portal')
  const [selectedItem, setSelectedItem] = useState<BrowseTreeItem | undefined>(
    selectedItemProps
  )
  const previousSelectedItem = usePrevious(selectedItemProps) as
    | BrowseTreeItem
    | undefined
  useEffect(() => {
    if (previousSelectedItem?.id !== selectedItemProps?.id) {
      setSelectedItem(selectedItemProps)
    }
  }, [previousSelectedItem, selectedItemProps])

  const onItemClick = (item: BrowseTreeItem): void => {
    setSelectedItem(item)
  }

  const onSave = (): void => {
    if (!selectedItem) {
      return
    }

    onSaveProps(selectedItem)
  }

  const onClose = (): void => {
    setSelectedItem(selectedItemProps)
    onCloseProps()
  }
  return (
    <SideDrawer
      headerContent={t('categories')}
      isOpen={isOpen}
      closeCallout={onClose}
      contentClassName={styles.sideDrawerContent}
      noContentPadding
      footerContent={
        <FormFooter
          cancelButtonProps={{ onClick: onClose }}
          saveButtonProps={{
            onClick: onSave,
            disabled: selectedItem === undefined,
            styleType: 'primary-blue',
          }}
        />
      }
      layerPosition={2}
    >
      <CollectionTreeView
        onItemClick={onItemClick}
        selectedItem={selectedItem}
        showTopics={false}
        checkedItems={checkedItems}
        setCheckedItems={setCheckedItems}
      />
    </SideDrawer>
  )
}
