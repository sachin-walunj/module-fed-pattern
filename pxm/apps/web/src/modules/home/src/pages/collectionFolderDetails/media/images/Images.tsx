'use client'

import { useCallback, useState } from 'react'

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { ListLoading, MenuActionProps, toast } from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { searchProducts, unAssignEntityFromCollection } from '../../actions'
import { AddExistingMedia } from '../AddExistingMedia'
import { MediaViewerData, SharedMediaLayout } from '../MediaLayout'
import NoDataAvailable from '../NoDataAvailable'

export type MediaViewerPrimaryAction = {
  text: string
  icon: MenuActionProps['icon']
  callout: () => void
}

export function Images({
  collectionFolderId,
  search,
  user,
}: {
  collectionFolderId: string
  search: string
  user: {
    role: string
    regions: { id: string }[]
  }
}) {
  const { t } = useTranslate('portal')
  const [totalImageCount, setTotalImageCount] = useState<number | null>(null)
  const [isAddExistingDrawerOpen, setIsAddExistingDrawerOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['searchProducts', collectionFolderId, search],
    queryFn: async ({ pageParam = 0 }) => {
      const payload = {
        filter: {
          terms: {
            topics: [collectionFolderId],
            roles: [user?.role],
            region: user?.regions.map((region) => region.id),
          },
        },
        type: ['image'],
        search: search,
        sort: 'alphabetical',
        from: String(pageParam * 50),
        size: '50',
      }

      const response = await searchProducts(payload, pageParam)

      if (pageParam === 0) {
        setTotalImageCount(response.total)
      }

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

  const { mutate: deleteSelectedImages, isPending: isDeletingImages } =
    useMutation({
      mutationFn: unAssignEntityFromCollection,
      onMutate: () => {
        toast({
          type: 'info',
          message: t('deletingImages'),
        })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['searchProducts'] })
        toast({
          type: 'success',
          message: t('imagesDeletedSuccessfully'),
        })
      },
      onError: () => {
        toast({
          type: 'error',
          message: t('imageDeletionFailed'),
        })
      },
    })

  const cardData =
    data?.pages.flatMap((page) =>
      page.hits.map((hit) => ({
        id: hit._source.id,
        fileProps: {
          data: [],
          isChecked: false,
          name: hit._source.file_name,
          url: `${process.env.CLIENT_CDN_ENDPOINT}/${hit._source.id}_thumb.png`,
        },
      }))
    ) || []

  const mediaViewerData: MediaViewerData[] = cardData.map((card) => ({
    isChecked: card.fileProps.isChecked,
    name: card.fileProps.name,
    url: card.fileProps.url,
    id: card.id,
    fileData: [],
  }))
  const handleDeleteSelected = (selectedIds: string[]) => {
    const payload = {
      ids: selectedIds,
      entities: [
        {
          type: 'topic',
          id: collectionFolderId,
        },
      ],
    }

    deleteSelectedImages(payload)
  }

  const handleUpload = () => {
    console.log('Uploading new image')
    // Implement  upload logic here
  }

  const handleUploadNew = () => {
    console.log('Uploading new image')
    // Implement  upload logic here
  }

  const handleAddExisting = () => {
    setIsAddExistingDrawerOpen(true)
  }

  const handleCloseAddExisting = useCallback(() => {
    setIsAddExistingDrawerOpen(false)
    refetch() // Refetch the searchProducts query when the drawer closes
  }, [refetch])
  const handleMediaViewerPrimaryAction = () => {
    console.log('Mediaviewer Primary Action')
    // Implement  Primary Action logic here
  }
  const mediaViewerPrimaryActions: MediaViewerPrimaryAction[] = [
    {
      text: 'Action 1',
      icon: 'share2',
      callout: () => {
        console.log('Action 1 clicked')
      },
    },
    {
      text: 'Action 2',
      icon: 'layers',
      callout: () => {
        console.log('Action 2 clicked')
      },
    },
  ]

  const footerRightActions: Array<{
    text: string
    icon: MenuActionProps['icon']
    callout: () => void
  }> = [
    {
      text: c('uploadNew'),
      icon: 'upload',
      callout: handleUploadNew,
    },
    {
      text: c('addExisting'),
      icon: 'plus',
      callout: handleAddExisting,
    },
  ]

  if (isLoading || totalImageCount === null) {
    return (
      <div className='mt-32'>
        <ListLoading />
      </div>
    )
  }

  return (
    <>
      {totalImageCount === 0 && <NoDataAvailable />}
      <SharedMediaLayout
        cardData={cardData}
        mediaViewerData={mediaViewerData}
        footerLeftButtonText={t('deleteImages')}
        footerRightPrimaryButtonText={c('upload')}
        footerRightActions={footerRightActions}
        footerRightSecondaryButtonText={t('downloadImages')}
        onDeleteSelected={handleDeleteSelected}
        onPrimaryAction={handleUpload}
        mediaViewerPrimaryActions={mediaViewerPrimaryActions}
        mediaViewerPrimaryActionText='Primary Action'
        onMediaViewerPrimaryAction={handleMediaViewerPrimaryAction}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        mediaType='image'
      />
      <AddExistingMedia
        isOpen={isAddExistingDrawerOpen}
        onClose={handleCloseAddExisting}
        collectionFolderId={collectionFolderId}
        user={user}
        mediaType='image'
      />
    </>
  )
}
