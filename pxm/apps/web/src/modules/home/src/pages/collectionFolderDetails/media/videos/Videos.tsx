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
export interface HitSource {
  id: string
  file_name: string
  uploaded_date: string
  file_size: number
  format: string
  file_path: string
}

interface MediaViewerFile {
  fileData: Array<{ label: string; value: string }>
  isChecked: boolean
  name: string
  url: string
  playableFileUrl?: {
    videoUrl?: string
    audioUrl?: string
  }
  id: string
}

export function Videos({
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
  const [totalVideoCount, setTotalVideoCount] = useState<number | null>(null)
  const [isAddExistingDrawerOpen, setIsAddExistingDrawerOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
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
        type: ['video'],
        search: search,
        sort: 'alphabetical',
        from: String(pageParam * 50),
        size: '50',
      }

      const response = await searchProducts(payload, pageParam)

      if (pageParam === 0) {
        setTotalVideoCount(response.total)
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

  const { mutate: deleteSelectedVideos, isPending: isDeletingVideos } =
    useMutation({
      mutationFn: unAssignEntityFromCollection,
      onMutate: () => {
        toast({
          type: 'info',
          message: t('deletingVideos'),
        })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['searchProducts'] })
        toast({
          type: 'success',
          message: t('videosDeletedSuccessfully'),
        })
      },
      onError: () => {
        toast({
          type: 'error',
          message: t('videoDeletionFailed'),
        })
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
            url: `${process.env.CLIENT_CDN_ENDPOINT}/${source.id}_thumb.jpg`,
          },
        }
      })
    ) || []

  const mediaViewerData: MediaViewerData[] =
    data?.pages.flatMap((page) =>
      page.hits.map((hit) => {
        const source = hit._source as HitSource
        const playableFileUrl = {
          videoUrl: `${process.env.CLIENT_CDN_ENDPOINT}/${source.id}`,
        }
        return {
          fileData: [
            {
              label: 'createdAt',
              value: new Date(source.uploaded_date).toLocaleString(),
            },
            { label: 'File Size', value: `${source.file_size} MB` },
          ],
          isChecked: false,
          name: source.file_name,
          url: `${process.env.CLIENT_CDN_ENDPOINT}/${source.id}_thumb.jpg`,
          playableFileUrl,
          id: source.id,
        }
      })
    ) || []

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
    deleteSelectedVideos(payload)
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

  if (isLoading || totalVideoCount === null) {
    return (
      <div className='mt-32'>
        <ListLoading />
      </div>
    )
  }

  return (
    <>
      {totalVideoCount === 0 && <NoDataAvailable />}
      <SharedMediaLayout
        cardData={cardData}
        mediaViewerData={mediaViewerData}
        footerLeftButtonText={t('deleteVideos')}
        footerRightPrimaryButtonText={c('share')}
        footerRightActions={footerRightActions}
        footerRightSecondaryButtonText={t('downloadVideos')}
        onDeleteSelected={handleDeleteSelected}
        onPrimaryAction={handleUpload}
        mediaViewerPrimaryActions={mediaViewerPrimaryActions}
        mediaViewerPrimaryActionText='Primary Action'
        onMediaViewerPrimaryAction={handleMediaViewerPrimaryAction}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        mediaType='video'
      />
      <AddExistingMedia
        isOpen={isAddExistingDrawerOpen}
        onClose={handleCloseAddExisting}
        collectionFolderId={collectionFolderId}
        user={user}
        mediaType='video'
      />
    </>
  )
}
