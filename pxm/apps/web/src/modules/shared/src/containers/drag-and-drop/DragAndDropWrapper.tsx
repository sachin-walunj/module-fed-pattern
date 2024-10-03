'use client'

import { useEffect, useRef } from 'react'

import Sortable, { MultiDrag, Swap } from 'sortablejs'

import styles from './drag-and-drop-wrapper.module.scss'

Sortable.mount(new MultiDrag(), new Swap())

interface HasId {
  id: string
}

interface BaseProps {
  //React component on which draggable and droppable wrapper is applied.
  children: React.ReactNode
  //Class name of the item for which dragging action has to be disabled.
  filteredClass: string
  //Class name of the section where draggging handle has to be applied.
  draggableClass: string
  //data Id attribute name.
  dataIdAttr: string
  //List of items which is made draggable.
  items: React.MutableRefObject<HasId[]>
  // Callback function called when drag operation ends, receives event with new order info.
  onEnd?: (event: Sortable.SortableEvent) => void
}

interface MultiDragProps extends BaseProps {
  //enable multi drag functionality.
  multiDrag: true
  //'swap' should not be provided if 'multiDrag' is true
  swap?: never
}

interface SwapProps extends BaseProps {
  //'multiDrag' should not be provided if 'swap' is true
  multiDrag?: never
  //enable swap functionality.
  swap: true
}

type DragAndDropWrapperProps = MultiDragProps | SwapProps

export const DragAndDropWrapper = ({
  children,
  multiDrag,
  swap,
  filteredClass,
  draggableClass,
  dataIdAttr,
  items,
  onEnd,
}: DragAndDropWrapperProps) => {
  const listRef = useRef<HTMLDivElement>(null)
  const selectedItems = useRef<number[]>([])

  const handleKeyDown = (event: Event) => {
    const CastedEvent = event as KeyboardEvent
    switch (CastedEvent.key) {
      case 'ArrowUp':
        handleArrowUpKey(CastedEvent.currentTarget as HTMLElement)
        break
      case 'ArrowDown':
        handleArrowDownKey(CastedEvent.currentTarget as HTMLElement)
        break
      default:
        break
    }
  }

  const handleArrowUpKey = (element: HTMLElement) => {
    if (selectedItems.current.length === 0) return
    selectedItems.current.sort((a, b) => a - b)
    const min = selectedItems.current[0]
    const startTargetIndex = min - 1
    if (startTargetIndex < 0) return

    const elements = Array.from(listRef.current!.children)
    if (!elements) return

    const prevInd = min - 1
    let newStartInd = min - 1
    let newArray: number[] = []
    const selectedItemsLength = selectedItems.current.length

    for (let i = 0; i < selectedItemsLength; i++) {
      const currInd = selectedItems.current[i]
      const currEle = elements[currInd] as HTMLElement
      const tarEle = elements[prevInd] as HTMLElement
      listRef.current?.insertBefore(currEle, tarEle)
      newArray = [...newArray, newStartInd]
      newStartInd++
    }
    updateItemOrder()
    selectedItems.current = newArray
    element.focus()
  }

  const handleArrowDownKey = (element: HTMLElement) => {
    if (selectedItems.current.length === 0) return
    selectedItems.current.sort((a, b) => a - b)
    const max = selectedItems.current[selectedItems.current.length - 1]
    const startTargetIndex = max + 1
    if (startTargetIndex >= items.current.length) return

    const elements = Array.from(listRef.current!.children)
    if (!elements) return

    let prevInd = max + 1
    let newStartInd = max + 1 - selectedItems.current.length + 1
    let newArray: number[] = []

    for (let i = 0; i < selectedItems.current.length; i++) {
      const currInd = selectedItems.current[i]
      const currEle = elements[currInd] as HTMLElement
      const tarEle = elements[prevInd] as HTMLElement
      listRef.current?.insertBefore(currEle, tarEle.nextSibling)
      prevInd = currInd
      newArray = [...newArray, newStartInd]
      newStartInd++
    }
    updateItemOrder()
    selectedItems.current = newArray
    element.focus()
  }

  const updateItemOrder = () => {
    const newOrder = Array.from(listRef.current!.children).map((child) => {
      const id = (child as HTMLElement).getAttribute('id')
      return items.current.find((item) => item.id === id)!
    })

    items.current = newOrder
  }

  const handleDocumentClick = (event: MouseEvent) => {
    if (listRef.current && !listRef.current.contains(event.target as Node)) {
      selectedItems.current = []
    }
  }

  const handleElementClick = (event: Event) => {
    const element = event.currentTarget as HTMLElement
    const parent = element.parentElement
    if (!parent) return

    const items = Array.from(parent.children)
    const currentIndex = items.indexOf(element)

    if (isSelected(element)) {
      element.focus()

      if (!selectedItems.current.includes(currentIndex)) {
        selectedItems.current = [...selectedItems.current, currentIndex]
      }
    } else {
      selectedItems.current = selectedItems.current.filter(
        (index) => index !== currentIndex
      )
    }
  }

  const isSelected = (element: HTMLElement) =>
    element.classList.contains(styles['selected'])

  useEffect(() => {
    if (listRef.current) {
      const sortable = new Sortable(listRef.current, {
        multiDrag: multiDrag,
        swap: swap,
        selectedClass: styles['selected'],
        filter: `.${filteredClass}`,
        ghostClass: styles['ghost'],
        handle: `.${draggableClass}`,
        animation: 100,
        dataIdAttr: dataIdAttr,
        scroll: true,
        scrollSensitivity: 100,
        scrollSpeed: 100,
        onEnd: (event: Sortable.SortableEvent) => {
          updateItemOrder()

          const elements = Array.from(listRef.current!.children)
          if (!elements) {
            return
          }

          let newArray: number[] = []
          elements.forEach((element, ind) => {
            if (isSelected(element as HTMLElement)) {
              newArray = [...newArray, ind]
              const castedElement = element as HTMLElement
              castedElement.focus()
            }
          })
          selectedItems.current = [...newArray]

          // Call the onEnd prop if it exists
          if (onEnd) {
            onEnd(event)
          }
        },
      })

      if (listRef.current) {
        const handleElements = listRef.current.querySelectorAll(
          `.${draggableClass}`
        )

        handleElements.forEach((element) => {
          const castedElement = element as HTMLElement
          castedElement.style.cursor = 'pointer'
        })

        document.addEventListener('click', handleDocumentClick)

        const selectedElements = Array.from(listRef.current!.children)
        selectedElements.forEach((element) => {
          // Add tabindex for focus
          element.setAttribute('tabindex', '0')
          // Add keyboard event listener
          element.addEventListener('keydown', (event) => handleKeyDown(event))
          element.addEventListener('click', handleElementClick)
        })
      }

      return () => {
        sortable.destroy()
        document.removeEventListener('click', handleDocumentClick)
      }
    }
  }, [onEnd])

  return <div ref={listRef}>{children}</div>
}

export default DragAndDropWrapper
