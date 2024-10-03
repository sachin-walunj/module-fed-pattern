'use client'

import { useCallback, useState } from 'react'

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  ListLoading,
  MenuActionProps,
  toast,
  useIsMobileView,
} from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { searchProducts, unAssignEntityFromCollection } from '../../actions'
import { AddExistingMedia } from '../AddExistingMedia'
import { SharedMediaLayout } from '../MediaLayout'
import NoDataAvailable from '../NoDataAvailable'
import { HitSource } from '../videos/Videos'

export type MediaViewerPrimaryAction = {
  text: string
  icon: MenuActionProps['icon']
  callout: () => void
}

export function Docs({
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
  const [isAddExistingDrawerOpen, setIsAddExistingDrawerOpen] = useState(false)
  const [totalDocsCount, setTotalDocsCount] = useState<number | null>(null)
  const queryClient = useQueryClient()
  const isMobile = useIsMobileView()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['searchDocsForProducts', collectionFolderId, search],
    queryFn: async ({ pageParam = 0 }) => {
      const payload = {
        filter: {
          terms: {
            topics: [collectionFolderId],
            roles: [user?.role],
            region: user?.regions.map((region) => region.id),
          },
        },
        type: ['document'],
        search: search,
        sort: 'alphabetical',
        from: String(pageParam * 50),
        size: '50',
      }

      const response = await searchProducts(payload, pageParam)

      if (pageParam === 0) {
        setTotalDocsCount(response.total)
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

  const { mutate: deleteSelectedDocs } = useMutation({
    mutationFn: unAssignEntityFromCollection,
    onMutate: () => {
      toast({
        type: 'info',
        message: t('deletingDocuments'),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchDocsForProducts'] })
      toast({
        type: 'success',
        message: t('documentsDeletedSuccessfully'),
      })
    },
    onError: () => {
      toast({
        type: 'error',
        message: t('documentDeletionFailed'),
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
              `Size: ${source.file_size} bytes`,
            ],
            isChecked: false,
            name: source.file_name,
            url: `${process.env.CLIENT_CDN_ENDPOINT}/${source.id}_thumb.jpg`,
          },
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

    deleteSelectedDocs(payload)
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

  if (isLoading || totalDocsCount === null) {
    return (
      <div className='mt-32'>
        <ListLoading />
      </div>
    )
  }
  const handleCardClick = (fileProps: {
    name: string
    url: string
    data?: string[]
    id: string
  }) => {
    const url = `${process.env.CLIENT_CDN_ENDPOINT}/${fileProps.id}`

    if (isMobile) {
      // For mobile devices,open in a new browser
      window.open(url, '_system', 'location=yes')
    } else {
      // For desktop, open in a new tab
      window.open(url, '')
    }
  }
  return (
    <>
      {totalDocsCount === 0 && <NoDataAvailable />}
      <SharedMediaLayout
        cardData={cardData}
        footerLeftButtonText={t('deleteDocs')}
        footerRightPrimaryButtonText={c('share')}
        footerRightActions={footerRightActions}
        footerRightSecondaryButtonText={t('downloadDocs')}
        onDeleteSelected={handleDeleteSelected}
        onPrimaryAction={handleUpload}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isMediaViewerDisabled={true}
        onCardClick={handleCardClick}
        mediaType='document'
      />
      <AddExistingMedia
        isOpen={isAddExistingDrawerOpen}
        onClose={handleCloseAddExisting}
        collectionFolderId={collectionFolderId}
        user={user}
        mediaType='document'
      />
    </>
  )
}
