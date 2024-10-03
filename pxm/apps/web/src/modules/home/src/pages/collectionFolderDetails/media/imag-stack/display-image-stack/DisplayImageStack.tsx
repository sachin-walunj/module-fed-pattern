import { useCallback, useEffect, useState } from 'react'

import moment from 'moment'
import Sortable from 'sortablejs'

import { ListLoading } from '@patterninc/react-ui'

import { DragAndDropWrapper } from '@amplifi-workspace/web-shared'

import ImageCard from '../image-cards/ImageCard'

import styles from './display-image-stack.module.scss'

interface FileType {
  id: string
  file_name: string
  imageUrl: string
}

interface DisplayImageStackProps {
  imageStackId: string
  topicId: string
  dateAndTime: string
  files: FileType[]
  onUpdateOrder: (newOrder: string[]) => Promise<void>
  isUpdating: boolean
}

const DisplayImageStack: React.FC<DisplayImageStackProps> = ({
  imageStackId,
  dateAndTime,
  files,
  onUpdateOrder,
  isUpdating,
}) => {
  const [localFiles, setLocalFiles] = useState(files)
  useEffect(() => {
    setLocalFiles(files)
  }, [files])

  const handleDragEnd = useCallback(
    (event: Sortable.SortableEvent) => {
      const newOrder = Array.from(event.to.children).map(
        (element) => element.id
      )
      setLocalFiles(
        localFiles.sort(
          (a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id)
        )
      )
      onUpdateOrder(newOrder)
    },
    [localFiles, onUpdateOrder]
  )

  const handleDelete = useCallback(
    (id: string) => {
      const newFiles = localFiles.filter((file) => file.id !== id)
      setLocalFiles(newFiles)
      onUpdateOrder(newFiles.map((file) => file.id))
    },
    [localFiles, onUpdateOrder]
  )

  const formattedDate = moment(dateAndTime).format('MM/DD/YYYY hh:mm A')

  return (
    <div>
      <div className={styles.metaContainer}>
        <div className={styles.dateAndTime}>{formattedDate}</div>
        <div className='fc-gray'>{localFiles.length} Items</div>
      </div>
      {isUpdating ? (
        <ListLoading />
      ) : (
        <DragAndDropWrapper
          multiDrag={true}
          filteredClass='filtered'
          draggableClass='draggableArea'
          dataIdAttr='id'
          items={{ current: localFiles }}
          onEnd={handleDragEnd}
        >
          {localFiles.map((file) => (
            <ImageCard
              key={file.id}
              {...file}
              customClassName='draggableArea'
              onDelete={handleDelete}
            />
          ))}
        </DragAndDropWrapper>
      )}
    </div>
  )
}

export default DisplayImageStack
