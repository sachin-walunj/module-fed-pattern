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
import { MediaViewerPrimaryAction } from '../images/Images'
import { MediaViewerData, SharedMediaLayout } from '../MediaLayout'
import NoDataAvailable from '../NoDataAvailable'
import { HitSource } from '../videos/Videos'

export function Misc({
  collectionFolderId,
  search = '',
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

  const [totalMiscCount, setTotalMiscCount] = useState<number | null>(null)
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
    queryKey: ['searchMiscForProducts', collectionFolderId, search],
    queryFn: async ({ pageParam = 0 }) => {
      const payload = {
        filter: {
          terms: {
            topics: [collectionFolderId],
            roles: [user?.role],
            region: user?.regions.map((region) => region.id),
          },
        },
        type: ['misc'],
        search: search,
        sort: 'alphabetical',
        from: String(pageParam * 50),
        size: '50',
      }
      const response = await searchProducts(payload, pageParam)

      if (pageParam === 0) {
        setTotalMiscCount(response.total)
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

  const cardData =
    data?.pages.flatMap((page) =>
      page.hits.map((hit) => {
        const source = hit._source as HitSource
        return {
          id: source.id,
          fileProps: {
            data: [
              `Uploaded ${new Date(source.uploaded_date).toLocaleDateString()}`,
            ],
            isChecked: false,
            name: source.file_name,
            url: `${process.env.CLIENT_CDN_ENDPOINT}/${source.id}_thumb.png`,
          },
        }
      })
    ) || []

  const mediaViewerData: MediaViewerData[] = cardData.map((card) => ({
    id: card.id,
    fileData: [],
    isChecked: card.fileProps.isChecked,
    name: card.fileProps.name,
    url: card.fileProps.url,
  }))

  const { mutate: deleteSelectedFiles } = useMutation({
    mutationFn: unAssignEntityFromCollection,
    onMutate: () => {
      toast({
        type: 'info',
        message: t('deletingFiles'),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchMiscForProducts'] })
      toast({
        type: 'success',
        message: t('filesDeletedSuccessfully'),
      })
    },
    onError: () => {
      toast({
        type: 'error',
        message: t('fileDeletionFailed'),
      })
    },
  })

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
    deleteSelectedFiles(payload)
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
  const handleMediaViewerPrimaryAction = () => null
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

  if (isLoading || totalMiscCount === null) {
    return (
      <div className='mt-32'>
        <ListLoading />
      </div>
    )
  }

  return (
    <>
      {totalMiscCount === 0 && <NoDataAvailable />}
      <SharedMediaLayout
        cardData={cardData}
        mediaViewerData={mediaViewerData}
        footerLeftButtonText={t('deleteMisc')}
        footerRightPrimaryButtonText={c('share')}
        footerRightActions={footerRightActions}
        footerRightSecondaryButtonText={t('downloadMisc')}
        onDeleteSelected={handleDeleteSelected}
        onPrimaryAction={handleUpload}
        mediaViewerPrimaryActions={mediaViewerPrimaryActions}
        mediaViewerPrimaryActionText='Primary Action'
        onMediaViewerPrimaryAction={handleMediaViewerPrimaryAction}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        mediaType='misc'
      />
      <AddExistingMedia
        isOpen={isAddExistingDrawerOpen}
        onClose={handleCloseAddExisting}
        collectionFolderId={collectionFolderId}
        user={user}
        mediaType='misc'
      />
    </>
  )
}
