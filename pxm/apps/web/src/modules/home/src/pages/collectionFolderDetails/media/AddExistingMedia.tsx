import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import Image from 'next/image'

import {
  Checkbox,
  FormFooter,
  ListLoading,
  SearchBar,
  SideDrawer,
  toast,
  trimText,
} from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import {
  assignFilesToTopic,
  productSearchForAddExistingMedia,
} from '../actions'

import styles from './add-existing-media.module.scss'

interface AddExistingMediaProps {
  isOpen: boolean
  onClose: () => void
  collectionFolderId: string
  user: {
    role: string
    regions: { id: string }[]
  }
  mediaType: 'image' | 'video' | 'document' | 'misc'
}

interface Hit {
  _id: string
  _index: string
  _score: number
  _source: {
    file_name: string
    file_path: string
    id: string
    created_date: string
  }
}

export const AddExistingMedia: React.FC<AddExistingMediaProps> = ({
  isOpen,
  onClose,
  collectionFolderId,
  user,
  mediaType,
}) => {
  const { t } = useTranslate('portal')
  const [selectedMediaIds, setSelectedMediaIds] = useState<Set<string>>(
    new Set()
  )
  const [localSearch, setLocalSearch] = useState('')
  const [selectAll, setSelectAll] = useState(false)
  const [loadedItemCount, setLoadedItemCount] = useState(0)
  const [selectedCount, setSelectedCount] = useState(0)

  const [isSearching, setIsSearching] = useState(false)
  const queryClient = useQueryClient()

  // Added a timestamp to force refetch when the drawer opens
  const [refetchTimestamp, setRefetchTimestamp] = useState(Date.now())

  useEffect(() => {
    if (isOpen) {
      setSelectedMediaIds(new Set())
      setSelectAll(false)
      setLocalSearch('')
      setLoadedItemCount(0)
      setRefetchTimestamp(Date.now()) // Updated the timestamp to force a refetch
    }
  }, [isOpen])

  const handleClose = () => {
    setLocalSearch('')
    onClose()
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      'searchProductsAdvanced',
      collectionFolderId,
      localSearch,
      mediaType,
      refetchTimestamp,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const payload = {
        type: [mediaType],
        filter: {
          metadata: {},
          range: {},
          term: {
            roles: user.role,
          },
          terms: {
            region: user.regions.map((region) => region.id),
          },
          exists: {},
        },
        must_not: {
          terms: {
            topics: [collectionFolderId],
          },
        },
        key: '',
        search: localSearch,
        roles: user.role,
        access: {
          empty_category_result: false,
          empty_category_hierarchy: false,
          empty_topic: false,
        },
        from: String(pageParam * 50),
        size: '50',
      }

      const response = await productSearchForAddExistingMedia(payload)
      return response
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / 50)
      const nextPage =
        allPages.length < totalPages ? allPages.length : undefined
      return nextPage
    },
  })

  useEffect(() => {
    if (data) {
      const newLoadedItemCount = data?.pages?.reduce(
        (total, page) => total + page.hits.length,
        0
      )
      setLoadedItemCount(newLoadedItemCount)
    }
  }, [data])

  //SetUp for Infinite Scrolling
  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })
      if (node) observer.current.observe(node)
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  )

  const handleMediaSelect = useCallback((id: string, isSelected: boolean) => {
    setSelectedMediaIds((prev) => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }, [])
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectAll(checked)
      if (checked && data) {
        const allIds = new Set(
          data.pages.flatMap((page) =>
            page.hits
              .filter((hit) => hit._source && hit._source.id)
              .map((hit) => hit._source.id)
          )
        )
        setSelectedMediaIds(allIds)
      } else {
        setSelectedMediaIds(new Set())
      }
    },
    [data]
  )

  useEffect(() => {
    if (data) {
      const newLoadedItemCount = data?.pages?.reduce(
        (total, page) => total + page.hits.length,
        0
      )
      setLoadedItemCount(newLoadedItemCount)

      // Update selectedMediaIds if selectAll is true
      if (selectAll) {
        const allIds = new Set(
          data?.pages?.flatMap((page) =>
            page.hits
              .filter((hit) => hit._source && hit._source.id)
              .map((hit) => hit._source.id)
          )
        )
        setSelectedMediaIds(allIds)
      }
    }
  }, [data, selectAll])

  useEffect(() => {
    setSelectedCount(selectedMediaIds.size)
  }, [selectedMediaIds])

  const handleSearch = useCallback(
    (searchInputText: string) => {
      setIsSearching(true)
      setLocalSearch(searchInputText)
      setSelectedMediaIds(new Set())
      setSelectAll(false)
      queryClient.resetQueries({ queryKey: ['searchProductsAdvanced'] })
      refetch().then(() => {
        setIsSearching(false)
      })
    },
    [refetch, queryClient]
  )
  const totalItemCount = data?.pages[0]?.total || 0
  const getImageUrl = (hit: Hit) => {
    let extension
    switch (mediaType) {
      case 'image':
        extension = 'webp'
        break
      case 'misc':
        extension = 'png'
        break
      case 'video':
      case 'document':
        extension = 'jpg'
        break
    }
    const imageUrl = `${process.env.CLIENT_CDN_ENDPOINT}/${hit._source.id}_thumb.${extension}`
    return imageUrl || `${process.env.STATIC_ASSETS_PREFIX}/images/no-img.svg`
  }

  const assignFilesMutation = useMutation({
    mutationFn: assignFilesToTopic,
    onSuccess: () => {
      toast({
        type: 'success',
        message: t('filesAddedSuccessfully'),
      })
      queryClient.invalidateQueries({ queryKey: ['searchProducts'] })
      queryClient.invalidateQueries({ queryKey: ['searchProductsAdvanced'] })
      setSelectedMediaIds(new Set())
      setSelectAll(false)
      onClose()
    },
    onError: () => {
      toast({
        type: 'error',
        message: t('failedToAddFiles'),
      })
    },
  })
  const handleAddMedia = () => {
    const payload = {
      ids: Array.from(selectedMediaIds),
      entities: [
        {
          type: 'topic',
          id: collectionFolderId,
        },
      ],
    }
    assignFilesMutation.mutate(payload)
  }

  return (
    <SideDrawer
      isOpen={isOpen}
      closeCallout={onClose}
      headerContent={t('addExistingMediaTypeToFolder', {
        type: mediaType.toUpperCase(),
      })}
      footerContent={
        <FormFooter
          cancelButtonProps={{
            children: c('cancel'),
            onClick: handleClose,
          }}
          saveButtonProps={{
            styleType: 'primary-blue',
            children:
              selectedCount > 0
                ? `${t('addToFolder')} (${selectedCount})`
                : t('addToFolder'),
            onClick: handleAddMedia,
            disabled: selectedCount === 0 || assignFilesMutation.isPending,
          }}
        />
      }
    >
      <div>
        <div className={styles.fixedContent}>
          <SearchBar value={localSearch} onChange={handleSearch} />
          <div className={styles.metaContainer}>
            <div className={styles.itemCount}>
              {isSearching || isLoading
                ? t('loading')
                : `${c('showing')}: ${loadedItemCount} / ${totalItemCount} ${c(
                    'items'
                  )}`}
            </div>
            <Checkbox
              label={c('selectAll')}
              checked={selectAll}
              callout={(_, checked) => handleSelectAll(checked)}
            />
          </div>
        </div>
        <div className={styles.scrollableContent}>
          {isLoading ? (
            <div className='mt-16'>
              <ListLoading />
            </div>
          ) : (
            <div className={styles.imageGrid}>
              {data?.pages.flatMap((page, pageIndex) =>
                page.hits.map((hit, index) => (
                  <div
                    key={hit._id}
                    ref={
                      pageIndex === data.pages.length - 1 &&
                      index === page.hits.length - 1
                        ? lastElementRef
                        : null
                    }
                    className={styles.card}
                  >
                    <div className={styles.mediaContainer}>
                      <Image
                        src={getImageUrl(hit)}
                        alt='Card Image'
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className={styles.content}>
                      <div>
                        <header className={styles.title}>
                          {trimText(hit._source.file_name, 30)}
                        </header>
                        <div className={styles.subTitle}>
                          <span>{mediaType}</span>
                        </div>
                      </div>
                      <div className={styles.actions}>
                        <Checkbox
                          hideLabel
                          label='No Label'
                          stateName={hit._source.id}
                          checked={selectedMediaIds.has(hit._source.id)}
                          callout={(stateName, checked) => {
                            if (stateName !== undefined) {
                              handleMediaSelect(stateName, checked)
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {isFetchingNextPage && <ListLoading />}
        </div>
      </div>
    </SideDrawer>
  )
}
