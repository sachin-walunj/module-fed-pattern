'use client'
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Button,
  Checkbox,
  Icon,
  Popover,
  Spinner,
  usePrevious,
} from '@patterninc/react-ui'

import { FolderItemOptionsComponent, FolderTreeDataItem } from './types'
import { Virtual, VirtualListProps } from './Virtualization'
import { BrowseTreeItem } from '../../../../_common/types/collectionTypes'

import styles from './folder-tree.module.scss'

interface FolderTreeProps<T> {
  items: FolderTreeDataItem<T>[]
  selectedItem: string
  onSelect: (value: string) => void
  checkedItems?: T[]
  setCheckedItems?: React.Dispatch<React.SetStateAction<T[]>>
}
export const FolderTree = <T,>({
  items,
  selectedItem,
  onSelect,
  checkedItems,
  setCheckedItems,
}: FolderTreeProps<T>) => {
  const [toggledItems, setToggledItems] = useState<string[]>([])

  const onToggleItem = (id: string, value: boolean): void => {
    if (value) {
      setToggledItems((prev) => [...prev, id])
    } else {
      setToggledItems((prev) => prev.filter((item) => item !== id))
    }
  }

  return (
    <FolderTreeContainer
      items={items}
      level={0}
      selectedItem={selectedItem}
      setSelectedItem={onSelect}
      toggledItems={toggledItems}
      setToggledItem={onToggleItem}
      checkedItems={checkedItems}
      setCheckedItems={setCheckedItems}
    />
  )
}

interface FolderTreePropsContainer<T> {
  items: FolderTreeDataItem<T>[]
  level: number
  selectedItem: string
  setSelectedItem: (value: string) => void
  toggledItems: string[]
  setToggledItem: (id: string, value: boolean) => void
  checkedItems?: T[]
  setCheckedItems?: React.Dispatch<React.SetStateAction<T[]>>
}
const FolderTreeContainerWithVirtualization = <T,>(
  props: FolderTreePropsContainer<T>
) => {
  return (
    <Virtual count={props.items.length} virtualizerProps={{ overscan: 10 }}>
      {({ virtualizer, virtualizedParentRef }) => (
        <FolderTreeContainerPrimitive
          containerRef={virtualizedParentRef}
          {...props}
        >
          {(children) => (
            <Virtual.DynamicList virtualizer={virtualizer}>
              {children}
            </Virtual.DynamicList>
          )}
        </FolderTreeContainerPrimitive>
      )}
    </Virtual>
  )
}

//Separate this out into its own component because the height wasn't being calculated correctly otherwise
type FolderTreeContainerPrimitiveProps<T> = FolderTreePropsContainer<T> & {
  containerRef: React.RefObject<HTMLDivElement>
  children: (children: VirtualListProps['children']) => JSX.Element
}
const FolderTreeContainerPrimitive = <T,>({
  containerRef,
  children,
  items,
  level,
  selectedItem,
  setSelectedItem,
  toggledItems,
  setToggledItem,
  checkedItems,
  setCheckedItems,
}: FolderTreeContainerPrimitiveProps<T>) => {
  const itemHeight = 37 //Height of each item in the tree
  const getItemHeight = useCallback(
    (item: FolderTreeDataItem<T>): number => {
      let height = itemHeight
      if (item.children.length && toggledItems.includes(item.id)) {
        height += item.children.reduce(
          (prev, curr) => prev + getItemHeight(curr),
          0
        )
      }
      return height
    },
    [toggledItems]
  )

  const height = useMemo(() => {
    const windowHeight = window.innerHeight
    if (containerRef.current && level === 0) {
      const containerRect = containerRef.current.getBoundingClientRect()
      return windowHeight - containerRect.top
    }
    return Math.min(
      items.reduce((prev, curr) => prev + getItemHeight(curr), 0),
      1000 //Default min height if there are many items
    )
  }, [containerRef, level, items, getItemHeight])

  return (
    <div
      className={styles.folderTreeContainer}
      ref={containerRef}
      style={{
        height,
      }}
    >
      {children(({ index, measureElement }) => (
        <FolderTreeItem
          key={index}
          ref={measureElement}
          item={items[index]}
          index={index}
          level={level || 0}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          setToggledItem={setToggledItem}
          toggledItems={toggledItems}
          checkedItems={checkedItems}
          setCheckedItems={setCheckedItems}
        />
      ))}
    </div>
  )
}

const FolderTreeContainer = memo(
  FolderTreeContainerWithVirtualization
) as typeof FolderTreeContainerWithVirtualization

//This is necessary to use the forwardRef with a generic component
declare module 'react' {
  function forwardRef<T, P = object>(
    render: (props: P, ref: ForwardedRef<T>) => ReactElement | null
  ): (props: P & RefAttributes<T>) => ReactElement | null
}
interface FolderTreeItemProps<T> {
  item: FolderTreeDataItem<T>
  level: number
  selectedItem: string
  setSelectedItem: (value: string) => void
  toggledItems: string[]
  setToggledItem: (id: string, value: boolean) => void
  index: number
  checkedItems?: T[]
  setCheckedItems?: React.Dispatch<React.SetStateAction<T[]>>
}
const FolderTreeItem = forwardRef(
  <T,>(
    {
      item,
      level,
      setSelectedItem,
      selectedItem,
      setToggledItem,
      toggledItems,
      index,
      checkedItems,
      setCheckedItems,
    }: FolderTreeItemProps<T>,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const toggled = toggledItems.includes(item.id)
    const [loading, setLoading] = useState(false)

    const prevOpen = usePrevious(item.isOpen)
    useEffect(() => {
      if (prevOpen !== item.isOpen) {
        setToggledItem(item.id, item.isOpen || false)
      }
    }, [prevOpen, item.isOpen, item.id, setToggledItem])

    const onClick = (): void => {
      setToggledItem(item.id, !toggled)
      setSelectedItem(item.id)
      if (item.onClick) {
        setLoading(true)
        item.onClick(item.data).then(() => setLoading(false))
      }
    }
    const paddingLevel = (level + 1) * 16
    const selected = Boolean(item.isSelected) || selectedItem === item.id
    const _toggled = Boolean(toggled && item.children.length)

    const containerClassName = useMemo(() => {
      let className = styles.folderItemRowContainer
      if (selected) {
        className += ` ${styles.folderItemSelected}`
      } else if (item.highlightLabel) {
        className += ` ${styles.folderItemHighlight}`
      }

      return className
    }, [selected, item.highlightLabel])

    const isChecked = useMemo(() => {
      return checkedItems !== undefined && checkedItems.includes(item.data)
    }, [checkedItems])
    const toggleChecked = useCallback(() => {
      setCheckedItems?.((prev) => {
        if (prev === undefined) {
          return [item.data]
        }
        if (prev.includes(item.data)) {
          return prev.filter((i) => i !== item.data)
        }
        return [...prev, item.data]
      })
    }, [setCheckedItems])

    return (
      <div
        className={styles.folderItemContainer}
        data-toggled={_toggled}
        ref={ref}
        data-index={index}
      >
        <div
          style={{ paddingLeft: paddingLevel }}
          className={containerClassName}
        >
          <div className={styles.folderItemRow} onClick={onClick}>
            {loading ? (
              <Spinner />
            ) : checkedItems !== undefined ? (
              <Checkbox checked={isChecked} label='' callout={toggleChecked} />
            ) : (
              <Icon icon={item.type} size='16px' />
            )}
            <LabelWithHighlight
              label={item.label}
              highlight={item.highlightLabel}
            />
          </div>
          {item.optionsContent ? (
            <OptionsButton content={item.optionsContent} data={item.data} />
          ) : null}
        </div>
        <div className={styles.folderChildrenContainer}>
          <FolderTreeContainer
            items={item.children}
            level={level + 1}
            /** Only check the children for selected items if the drawer is open and not selected */
            selectedItem={!_toggled || selected ? '' : selectedItem}
            setSelectedItem={setSelectedItem}
            toggledItems={toggledItems}
            setToggledItem={setToggledItem}
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
          />
        </div>
      </div>
    )
  }
)

//Breaks up the label into parts to highlight the search if needed
const LabelWithHighlight: React.FC<{ label: string; highlight?: string }> = ({
  label,
  highlight,
}) => {
  if (highlight) {
    const matchedIndex = label.toLowerCase().indexOf(highlight)
    if (matchedIndex === -1) {
      return label
    }
    const match = label.slice(matchedIndex, matchedIndex + highlight.length)
    const before = label.slice(0, matchedIndex)
    const after = label.slice(matchedIndex + highlight.length)
    return (
      <div>
        {before}
        <span className={styles.highlight}>{match}</span>
        {after}
      </div>
    )
  }

  return <div>{label}</div>
}

interface OptionsButtonProps<T> {
  content: FolderItemOptionsComponent<T>
  data: T
}
const OptionsButton = <T,>({
  content: FolderItemOptionsComponent,
  data,
}: OptionsButtonProps<T>) => {
  return (
    <Popover
      popoverContent={({ setVisible }) => (
        <FolderItemOptionsComponent
          item={data}
          onClose={() => setVisible(false)}
        />
      )}
      tippyProps={{ placement: 'left' }}
      noPadding
    >
      {({ setVisible, visible }) => (
        <Button
          as='unstyled'
          className={`${styles.folderItemOptions}${
            visible ? ` ${styles.folderItemOptionsHover}` : ''
          }`}
          onClick={() => setVisible(!visible)}
        >
          <Icon icon='options' size='16px' customClass='svg-blue' />
        </Button>
      )}
    </Popover>
  )
}
