import { useRef } from 'react'

import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual'

type VirtualProps = {
  /** This is the number of rows in the dataset */
  count: number
  /** Children is a function that has access to the useVirtualizer hook value and the ref that needs to be wrapped around the virtualized content. */
  children: ({
    virtualizer,
    virtualizedParentRef,
  }: {
    virtualizer: ReturnType<typeof useVirtualizer>
    virtualizedParentRef: React.MutableRefObject<null>
  }) => JSX.Element
  /** Optionally pass in more react-virtualå props for the useVirtualizer */
  virtualizerProps?: Partial<Parameters<typeof useVirtualizer>[0]>
}

const Virtual = ({
  count,
  children,
  virtualizerProps,
}: VirtualProps): JSX.Element => {
  const virtualizedParentRef = useRef(null),
    virtualizer = useVirtualizer({
      count,
      getScrollElement: () => virtualizedParentRef.current,
      estimateSize: () => 40,
      overscan: 5,
      ...virtualizerProps,
    })

  return children({ virtualizer, virtualizedParentRef })
}

export type VirtualListProps = {
  virtualizer: ReturnType<typeof useVirtualizer>
  children: (props: {
    index: number
    measureElement: VirtualItem<Element>['measureElement']
  }) => JSX.Element
}

const VirtualDynamicList = ({
  virtualizer,
  children,
}: VirtualListProps): JSX.Element => {
  return (
    <div
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      <div
        style={{
          transform: `translateY(${
            virtualizer.getVirtualItems()[0]?.start ?? 0
          }px)`,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) =>
          children({
            index: virtualRow.index,
            measureElement: virtualRow.measureElement,
          })
        )}
      </div>
    </div>
  )
}

Virtual.DynamicList = VirtualDynamicList

export { Virtual }
