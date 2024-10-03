import { useCallback, useRef } from 'react'

import moment from 'moment'

import { ListLoading } from '@patterninc/react-ui'

import { ProductSearchResponse } from '../../../../actions'
import AddImageCard from '../../image-cards/AddImageCard'

import styles from './add-images-to-image-stack.module.scss'

interface AddImagesToImageStackProps {
  imageStackId: string
  dateAndTime: string
  searchResults: ProductSearchResponse['hits']
  isLoading: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  hasNextPage: boolean | undefined
  onSelect: (id: string, isSelected: boolean) => void
  selectedImageIds: Set<string>
  totalImageCount: number
}

const AddImagesToImageStack: React.FC<AddImagesToImageStackProps> = ({
  imageStackId,
  dateAndTime,
  searchResults,
  isLoading,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
  onSelect,
  selectedImageIds,
  totalImageCount,
}) => {
  // Set up for an intersection observer for infinite scrolling //
  //This creates a ref to store the Intersection Observer.
  const observer = useRef<IntersectionObserver | null>(null)

  // Callback function to set up the Intersection Observer for infinite scrolling.
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return // If we're already loading, don't do anything
      if (observer.current) observer.current.disconnect() // Disconnect the previous observer if it exists
      // Create a new Intersection Observer
      observer.current = new IntersectionObserver((entries) => {
        // If the last element is intersecting (visible) and there's a next page
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage() // Fetch the next page when the last element is visible
        }
      })
      if (node) observer.current.observe(node) // Start observing the node if it exists
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  )

  const handleImageSelect = useCallback(
    (id: string, isSelected: boolean) => {
      onSelect(id, isSelected)
    },
    [onSelect]
  )

  const formattedDate = moment(dateAndTime).format('MM/DD/YYYY hh:mm A')

  return (
    <div>
      <div className={styles.metaContainer}>
        <div className={styles.dateAndTime}>{formattedDate}</div>
        <div className='fc-gray'>{totalImageCount} Items</div>
      </div>
      {isLoading ? (
        <ListLoading />
      ) : (
        <div className={styles.imageGrid}>
          {searchResults.map((result, index) => {
            const imageSources = [
              `${process.env.CLIENT_CDN_ENDPOINT}/${result._source.id}_thumb.webp`,
              `${process.env.CLIENT_CDN_ENDPOINT}/${result._source.id}_thumb.png`,
              `${process.env.CLIENT_CDN_ENDPOINT}/${result._source.id}_thumb.jpg`,
              `/images/no-img.svg`,
            ]

            return (
              <div
                key={result._id}
                // Attach the lastElementRef to the last item for infinite scrolling
                ref={index === searchResults.length - 1 ? lastElementRef : null}
              >
                <AddImageCard
                  id={result._source.id}
                  file_name={result._source.file_name}
                  imageUrl={imageSources}
                  isSelected={selectedImageIds.has(result._source.id)}
                  onSelect={handleImageSelect}
                />
              </div>
            )
          })}
        </div>
      )}
      {isFetchingNextPage && <ListLoading />}
    </div>
  )
}

export default AddImagesToImageStack
