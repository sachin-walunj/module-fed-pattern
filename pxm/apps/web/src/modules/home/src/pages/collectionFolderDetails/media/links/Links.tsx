'use client'

import { useMemo, useState } from 'react'

import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import ExcelJS from 'exceljs'
import FileSaver from 'file-saver'

import {
  FormFooter,
  ListLoading,
  MenuActionProps,
  SideDrawer,
  toast,
} from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import AddNewLink from './AddNewLink'
import {
  addLink,
  AddLinkData,
  deleteLink,
  fetchLinks,
  FetchLinksPayload,
  getTopic,
  LinkResponse,
} from '../../actions'
import { SharedMediaLayout } from '../MediaLayout'
import NoDataAvailable from '../NoDataAvailable'

export type MediaViewerPrimaryAction = {
  text: string
  icon: MenuActionProps['icon']
  callout: () => void
}

export function Links({
  collectionFolderId,
  search,
  user,
}: {
  collectionFolderId: string
  search: string
  user: {
    user_id: string
    role: string
    regions: { id: string }[]
  }
}) {
  const { t } = useTranslate('portal')
  const [totalLinkCount, setTotalLinkCount] = useState<number | null>(null) // this state will get used to show the count of total results
  const queryClient = useQueryClient()

  const [linkState, updateLinkState] = useState<{
    description: string
    title: string
    image: string
    link: string
  }>({
    description: '',
    title: '',
    image: '',
    link: '',
  })

  const fetchLinksMutation = useMutation<
    LinkResponse,
    Error,
    FetchLinksPayload
  >({
    mutationFn: fetchLinks,
  })

  const fetchLinksQuery = useInfiniteQuery({
    queryKey: ['fetchLinks', collectionFolderId, search],
    queryFn: async ({ pageParam = 0 }) => {
      const payload: FetchLinksPayload = {
        start: pageParam * 50,
        limit: 50,
        sort_column: 'created_date',
        sort_direction: 'desc',
        entity: 'topic',
        entity_id: collectionFolderId,
        reset_current_page: false,
        sort: 'alphabetical',
      }
      const response = await fetchLinksMutation.mutateAsync(payload)
      if (pageParam === 0) {
        setTotalLinkCount(response.count)
      }
      return response
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.count / 50)
      const nextPage =
        allPages.length < totalPages ? allPages.length : undefined
      return nextPage
    },
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    fetchLinksQuery
  const [isOpen, setIsOpen] = useState(false)

  const { mutate: deleteSelectedLinks } = useMutation({
    mutationFn: async (linkIds: string[]) => {
      const results = await Promise.all(
        linkIds.map((id) =>
          deleteLink({
            id,
            topics: [],
            metadata: {
              initiated_by: user.user_id,
            },
          })
        )
      )
      return results
    },
    onMutate: () => {
      toast({
        type: 'info',
        message: 'Deleting Links...',
      })
    },
    onSuccess: (_, deletedLinkIds) => {
      // Update the query cache
      queryClient.setQueryData<InfiniteData<LinkResponse>>(
        ['fetchLinks', collectionFolderId, search],
        (oldData) => {
          if (!oldData) return oldData
          const newPages = oldData.pages.map((page) => ({
            ...page,
            data: page.data.filter((link) => !deletedLinkIds.includes(link.id)),
            count: page.count - deletedLinkIds.length,
          }))
          setTotalLinkCount((prev) =>
            prev !== null ? prev - deletedLinkIds.length : prev
          )
          return {
            ...oldData,
            pages: newPages,
          }
        }
      )
      toast({
        type: 'success',
        message: 'Links deleted successfully.',
      })
    },
    onError: () => {
      toast({
        type: 'error',
        message: 'Link deletion failed.',
      })
    },
  })

  const { mutate: saveNewLink } = useMutation({
    mutationFn: async () => {
      const payload: AddLinkData = {
        description: linkState.title,
        details: linkState.description,
        image: linkState.image,
        link: linkState.link,
        metadata: {
          initiated_by: user.user_id,
        },
        topics: [collectionFolderId],
        status: 'Active',
      }

      const response = await addLink(payload)
      return response
    },
    onSuccess: () => {
      toast({
        type: 'success',
        message: t('linkAdditionSuccessful'),
      })
      setIsOpen(false)
      queryClient.invalidateQueries()
    },
    onError: () => {
      toast({
        type: 'error',
        message: t('linkAdditionFailed'),
      })
    },
  })

  const cardData = useMemo(() => {
    return (
      data?.pages.flatMap((page) =>
        page.data.map((link) => ({
          id: link.id,
          fileProps: {
            data: [
              `Uploaded ${new Date(link.created_date).toLocaleDateString(
                'en-US',
                { month: 'short', day: 'numeric', year: 'numeric' }
              )}`,
            ],
            isChecked: false,
            name: link.description,
            url:
              link.image ||
              `${process.env.STATIC_ASSETS_PREFIX}/images/no-img.svg`,
            created: `${new Date(link.created_date).toLocaleDateString(
              'en-US',
              {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
              }
            )}`,
            link: link.link,
            details: link.details,
          },
        }))
      ) || []
    )
  }, [data])

  const mediaViewerData = useMemo(
    () =>
      cardData.map((card) => ({
        isChecked: card.fileProps.isChecked,
        name: card.fileProps.name,
        url: card.fileProps.url,
        id: card.id,
        link: card.fileProps.link,
        created: card.fileProps.created,
        details: card.fileProps.details,
      })),
    [cardData]
  )

  const handleDeleteSelected = (selectedIds: string[]) => {
    deleteSelectedLinks(selectedIds)
  }

  const handleDownload = async (selectedIds: string[]) => {
    const topicData = await getTopic(collectionFolderId)
    const { name } = topicData
    if (!selectedIds.length) {
      toast({
        type: 'error',
        message: t('pleaseSelectTheLinks'),
      })
      return
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(t('resources'))
    worksheet.columns = [
      { header: t('description'), key: 'description', width: 50 },
      { header: t('link'), key: 'link', width: 50 },
    ]

    const rows = cardData
      .filter((card) => selectedIds.includes(card.id))
      .map((card) => ({
        description: card.fileProps.name,
        link: card.fileProps.link,
      }))

    worksheet.addRows(rows)
    worksheet.state = 'visible'

    try {
      const buffer = await workbook.xlsx.writeBuffer()
      FileSaver.saveAs(new Blob([buffer]), `${name}.xlsx`)

      toast({
        type: 'info',
        message: c('success'),
      })
    } catch (error) {
      toast({
        type: 'info',
        message: c('error'),
      })
    }
  }

  const handleUploadNew = () => {
    console.log('Uploading new image')
  }

  const handleAddNewLink = () => {
    saveNewLink()
  }

  const handleAddExisting = () => {
    console.log('Adding existing image')
    // Implement  add existing logic here
  }
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

  if (isLoading || totalLinkCount === null) {
    return (
      <div className='mt-32'>
        <ListLoading />
      </div>
    )
  }

  return (
    <>
      {totalLinkCount === 0 && <NoDataAvailable />}
      <SharedMediaLayout
        cardData={cardData}
        mediaViewerData={mediaViewerData}
        footerLeftButtonText={t('deleteLinks')}
        footerRightPrimaryButtonText={t('addLink')}
        footerRightActions={[]}
        footerRightSecondaryButtonText={t('downloadLinks')}
        onDeleteSelected={(selectedIds) => {
          handleDeleteSelected(selectedIds)
        }}
        onDownloadLinks={handleDownload}
        onPrimaryAction={() => setIsOpen(!isOpen)}
        mediaViewerPrimaryActions={mediaViewerPrimaryActions}
        mediaViewerPrimaryActionText={c('edit')}
        onMediaViewerPrimaryAction={handleMediaViewerPrimaryAction}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isLinkTab={true}
        mediaType='links'
      />
      <SideDrawer
        footerContent={
          <FormFooter
            cancelButtonProps={{ onClick: () => setIsOpen(false) }}
            saveButtonProps={{
              children: c('save'),
              onClick: handleAddNewLink,
            }}
          />
        }
        headerContent={t('newLink')}
        isOpen={isOpen}
        closeCallout={() => setIsOpen(false)}
      >
        <AddNewLink linkState={linkState} updateLinkState={updateLinkState} />
      </SideDrawer>
    </>
  )
}
