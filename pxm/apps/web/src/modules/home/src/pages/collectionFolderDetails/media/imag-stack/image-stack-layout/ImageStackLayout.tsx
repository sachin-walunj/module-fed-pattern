'use client'
import { useCallback, useState } from 'react'

import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'

import {
  Button,
  Card,
  FormFooter,
  Icon,
  NewSelect,
  PageFooter,
  PageFooterProps,
  SideDrawer,
  toast,
} from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import AddImagesToImageStack from './add-images/AddImagesToImageStack'
import { DownloadWithVariants } from '../../../../../_common/components/DownloadWithVariants'
import { FileConfig } from '../../../../../_common/types/downloadVariantTypes'
import { ImageStackCardData } from '../../../../../_common/types/imageStackTypes'
import { GenerateDownload } from '../../../../../_common/utils/download'
import {
  getImageStack,
  GetImageStackPayload,
  updateImageStackOrder,
} from '../../../../../server/imageStackActions'
import {
  ProductSearchPayload,
  ProductSearchResponse,
  searchProducts,
} from '../../../actions'
import NoDataAvailable from '../../NoDataAvailable'
import {
  createStack,
  CreateStackPayload,
  deleteImageStack,
  getStackGroups,
} from '../actions'
import DisplayImageStack from '../display-image-stack/DisplayImageStack'

import styles from './image-stack-layout.module.scss'

export type StackGroup = {
  id: string
  name: string
}

interface ImageStackLayoutProps {
  footerRightPrimaryButtonText: string
  collectionFolderId: string
  initialImageStacks: ImageStackCardData[]
  user: {
    role: string
    regions: { id: string }[]
  }
}

interface ActiveImageStackType {
  id: string
  name: string
  dateAndTime: string
  files: {
    id: string
    file_name: string
    imageUrl: string
  }[]
}

const initialActiveImageStack: ActiveImageStackType = {
  id: '',
  name: '',
  dateAndTime: '',
  files: [],
}

const ImageStackLayout: React.FC<ImageStackLayoutProps> = ({
  footerRightPrimaryButtonText,
  collectionFolderId,
  initialImageStacks,
  user,
}) => {
  const { t } = useTranslate('portal')
  const [imageStacks, setImageStacks] = useState(initialImageStacks)
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false)
  const [isAddImagesSideDrawerOpen, setIsAddImagesSideDrawerOpen] =
    useState(false)
  const [activeImageStack, setActiveImageStack] =
    useState<ActiveImageStackType>(initialActiveImageStack)
  const [isCreateImageStackDrawerOpen, setIsCreateImageStackDrawerOpen] =
    useState(false)
  const [isDownloadDrawerOpen, setIsDownloadDrawerOpen] =
    useState<boolean>(false)
  const [selectedStackGroup, setSelectedStackGroup] =
    useState<StackGroup | null>(null)
  const downloadFiles = GenerateDownload()
  const { data: stackGroups, isLoading } = useQuery<StackGroup[], Error>({
    queryKey: ['stackGroups'],
    queryFn: async () => {
      const result = await getStackGroups()
      return result
    },
    enabled: isCreateImageStackDrawerOpen,
  })

  const handleStackGroupSelect = (selected: StackGroup) => {
    setSelectedStackGroup(selected)
  }

  const defaultStackGroup: StackGroup = {
    id: '',
    name: '',
  }

  const handleCreateImageStackDrawer = () => {
    setIsCreateImageStackDrawerOpen(true)
  }

  const handleCloseCreateImageStackDrawer = () => {
    setIsCreateImageStackDrawerOpen(false)
    setSelectedStackGroup(null)
  }

  const [totalImageCount, setTotalImageCount] = useState<number>(0)
  //This state is used to show the loader when the user adds images to the image stack
  const [isAddingNewImages, setIsAddingNewImages] = useState(false)

  const updateOrDeleteStackMutation = useMutation({
    mutationFn: ({
      stackId,
      newOrder,
      isDelete = false,
    }: {
      stackId: string
      newOrder: string[]
      isDelete?: boolean
    }) => updateImageStackOrder(stackId, newOrder),
    onSuccess: async (_, variables) => {
      const message = variables.isDelete
        ? t('imageRemovedFromStackSuccessfully')
        : t('imageStackOrderUpdatedSuccessfully')

      toast({
        type: 'success',
        message,
      })
      const { stackId, newOrder } = variables
      setImageStacks((prevStacks) =>
        prevStacks.map((stack) =>
          stack.id === stackId
            ? {
                ...stack,
                files: newOrder.map((id) => {
                  const file = stack.files.find((f) => f.id === id)
                  return file ? file : { id, file_name: '', imageUrl: '' }
                }),
                fileProps: {
                  ...stack.fileProps,
                  url:
                    newOrder.length > 0
                      ? `${process.env.CLIENT_CDN_ENDPOINT}/${newOrder[0]}_thumb.png`
                      : `/images/no-img.svg`,
                },
              }
            : stack
        )
      )
      setActiveImageStack((prev) => ({
        ...prev,
        files: prev.files.filter((file) => newOrder.includes(file.id)),
      }))
    },
    onError: () => {
      toast({
        type: 'error',
        message: t('failedToUpdateImageStackOrder'),
      })
    },
  })

  const [shouldFetch, setShouldFetch] = useState(false)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['searchProducts', collectionFolderId], // Unique key for this query
      // Function to fetch each page of data
      queryFn: async ({ pageParam }) => {
        const payload: ProductSearchPayload = {
          filter: {
            terms: {
              topics: [collectionFolderId],
              roles: [user?.role],
              region: user?.regions.map((region) => region.id),
            },
          },
          type: ['image'],
          search: '', // This doesn't applies because now we have separate tabs for Images and ImageStacks
          sort: 'alphabetical', //adding it as 'alphabetical' because currently we dont have sorting on the ImageStack tab
          from: String(pageParam * 50), // Calculate the 'from' parameter based on the current page
          size: '50',
        }
        const response = await searchProducts(payload, pageParam)

        // Update the total count when we get the first page of results
        if (pageParam === 0) {
          setTotalImageCount(response.total)
        }

        return response
      },
      initialPageParam: 0, // Start with the first page (index 0)
      // Determine if there's a next page to fetch
      getNextPageParam: (
        lastPage: ProductSearchResponse,
        allPages: ProductSearchResponse[]
      ) => {
        const totalPages = Math.ceil(lastPage.total / 50)
        // If we haven't fetched all pages, return the next page number
        return allPages.length < totalPages ? allPages.length : undefined
      },
      enabled: shouldFetch, // Only start fetching when shouldFetch is true
    })
  // Function to trigger the first fetch
  const handleAddImagesClick = useCallback(() => {
    setIsAddImagesSideDrawerOpen(true)
    setShouldFetch(true)
  }, [])

  const handleUpdateOrder = useCallback(
    async (newOrder: string[]): Promise<void> => {
      const currentIds = activeImageStack.files.map((file) => file.id)
      const isDelete = newOrder.length < currentIds.length

      await updateOrDeleteStackMutation.mutateAsync({
        stackId: activeImageStack.id,
        newOrder,
        isDelete,
      })
    },
    [activeImageStack.id, activeImageStack.files, updateOrDeleteStackMutation]
  )

  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(
    new Set()
  )

  const addImagesToStackMutation = useMutation({
    mutationFn: ({
      stackId,
      newOrder,
    }: {
      stackId: string
      newOrder: string[]
    }) => updateImageStackOrder(stackId, newOrder),
    onSuccess: async (_, variables) => {
      toast({
        type: 'success',
        message: t('imagesAddedToStackSuccessfully'),
      })
      setIsAddImagesSideDrawerOpen(false)

      // Fetch the updated image stacks
      const payload: GetImageStackPayload = {
        topic_id: collectionFolderId,
        page: 1,
      }
      const updatedStacks = await getImageStack(payload)

      // Find the updated stack
      const updatedStack = updatedStacks.find(
        (stack) => stack.id === variables.stackId
      )

      if (updatedStack) {
        const updatedFiles = updatedStack.files.map((file) => ({
          id: file.id,
          file_name: file.file_name,
          imageUrl: `${process.env.CLIENT_CDN_ENDPOINT}/${file.id}_thumb.png`,
        }))

        setImageStacks((prevStacks) =>
          prevStacks.map((stack) =>
            stack.id === variables.stackId
              ? {
                  ...stack,
                  files: updatedFiles,
                  fileProps: {
                    ...stack.fileProps,
                    url:
                      updatedFiles.length > 0
                        ? updatedFiles[0].imageUrl
                        : `/images/no-img.svg`,
                  },
                }
              : stack
          )
        )

        setActiveImageStack((prev) => ({
          ...prev,
          files: updatedFiles,
        }))
      }

      setSelectedImageIds(new Set())
      setIsAddingNewImages(false)
    },
    onError: () => {
      toast({
        type: 'error',
        message: t('failedToAddImagesToStack'),
      })
    },
  })

  const handleImageSelection = useCallback(
    (id: string, isSelected: boolean) => {
      setSelectedImageIds((prev) => {
        const newSet = new Set(prev)
        isSelected ? newSet.add(id) : newSet.delete(id)
        return newSet
      })
    },
    []
  )

  const handleSaveNewImages = useCallback(() => {
    setIsAddingNewImages(true)
    const updatedImageIds = [
      ...activeImageStack.files.map((file) => file.id),
      ...Array.from(selectedImageIds),
    ]

    addImagesToStackMutation.mutate({
      stackId: activeImageStack.id,
      newOrder: updatedImageIds,
    })
  }, [activeImageStack, selectedImageIds, addImagesToStackMutation])
  const createStackMutation = useMutation({
    mutationFn: (payload: CreateStackPayload) => createStack(payload),
    onSuccess: async (data) => {
      toast({
        type: 'success',
        message: t('imageStackCreatedSuccessfully'),
      })
      handleCloseCreateImageStackDrawer()

      // Add the new stack to the existing state
      const newStack: ImageStackCardData = {
        id: data.generated_keys[0],
        fileProps: {
          data: [new Date().toISOString()],
          name: selectedStackGroup?.name || '',
          url: `/images/no-img.svg`,
        },
        files: [], // New stack starts with no files
      }

      setImageStacks((prevStacks) => [...prevStacks, newStack])
    },
    onError: () => {
      toast({
        type: 'error',
        message: t('failedToCreateImageStack'),
      })
    },
  })
  const { mutate: deleteStack, isPending: isDeletePending } = useMutation({
    mutationFn: (stackId: string) => deleteImageStack(stackId),
    onSuccess: (data, variables) => {
      toast({
        type: 'success',
        message: t('imageStackDeletedSuccessfully'),
      })
      setIsSideDrawerOpen(false)
      // Remove the deleted stack from the state
      setImageStacks((prevStacks) =>
        prevStacks.filter((stack) => stack.id !== variables)
      )
    },
    onError: () => {
      toast({
        type: 'error',
        message: t('failedToDeleteImageStack'),
      })
    },
  })

  const handleDeleteStack = () => {
    if (activeImageStack.id) {
      deleteStack(activeImageStack.id)
    }
  }

  const rightSectionActions: PageFooterProps['rightSection'] = [
    {
      type: 'buttonGroup',
      styleType: 'primary-blue',
      buttons: [
        {
          actions: [
            {
              callout: () => console.log('Action 1'),
              icon: 'pencil',
              text: 'Action 1',
            },
            {
              callout: () => console.log('Action 2'),
              icon: 'plus',
              text: 'Action 2',
            },
          ],
        },
        {
          children: t('createImageStack', {
            text: footerRightPrimaryButtonText,
          }),
          onClick: handleCreateImageStackDrawer,
        },
      ],
    },
  ]

  const sideDrawerFooterContent = (
    <div className={styles.footerContainer}>
      <div>
        <Button
          as='confirmation'
          styleType='text-red'
          disabled={isDeletePending}
          confirmation={{
            body: `Are you sure you want to delete the image stack "${activeImageStack.name}"?`,
            cancelButtonText: 'Cancel',
            confirmButtonText: isDeletePending ? c('deleting') : c('delete'),
            confirmCallout: handleDeleteStack,
            header: c('confirmDelete'),
            type: 'red',
          }}
        >
          {isDeletePending ? c('deleting') : c('delete')}
        </Button>
      </div>
      <div className={styles.footerRightSection}>
        <Button
          as='button'
          styleType='tertiary'
          onClick={() => {
            if (!activeImageStack.files.length) {
              toast({
                type: 'error',
                message: t('pleaseAddImagesToTheImageStack'),
              })
              return
            }
            setIsDownloadDrawerOpen(true)
          }}
        >
          <Icon icon='download' />
        </Button>

        <Button as='button' styleType='tertiary' onClick={handleAddImagesClick}>
          <Icon icon='plus' />
        </Button>

        <Button
          as='button'
          styleType='primary-blue'
          onClick={handleSaveNewImages}
        >
          Save
        </Button>
      </div>
    </div>
  )

  const downloadVariants = (fileConfig: FileConfig) => {
    const payload = {
      entities: activeImageStack.files.map((image) => ({
        name: image.file_name,
        id: image.id,
        type: 'file',
      })),
      file_config: fileConfig,
      entity_type: 'file',
      role: user?.role,
      region: user?.regions.map((region) => region.id),
      wait: true,
    }

    downloadFiles(payload) // API call for /file/compress

    setIsDownloadDrawerOpen(false)
  }

  return (
    <div>
      {initialImageStacks.length > 0 ? (
        <div className={styles.cardContainer}>
          {imageStacks.map((card) => (
            <Card
              key={card.id}
              fileProps={{
                ...card.fileProps,
                url: card.fileProps.url,
              }}
              cardCallout={() => {
                setActiveImageStack({
                  id: card.id,
                  name: card.fileProps.name,
                  dateAndTime: card.fileProps.data[0],
                  files: card.files,
                })

                setIsSideDrawerOpen((prevState) => !prevState)
              }}
            />
          ))}
        </div>
      ) : (
        <NoDataAvailable />
      )}
      <SideDrawer
        headerContent={activeImageStack.name}
        isOpen={isSideDrawerOpen}
        closeCallout={() => setIsSideDrawerOpen((prevState) => !prevState)}
        footerContent={sideDrawerFooterContent}
      >
        <DisplayImageStack
          imageStackId={activeImageStack.id}
          topicId={collectionFolderId}
          dateAndTime={activeImageStack.dateAndTime}
          files={activeImageStack.files}
          onUpdateOrder={handleUpdateOrder}
          isUpdating={isAddingNewImages}
        />
      </SideDrawer>
      <SideDrawer
        footerContent={
          <FormFooter
            cancelButtonProps={{
              onClick: () =>
                setIsAddImagesSideDrawerOpen((prevstate) => !prevstate),
            }}
            saveButtonProps={{
              children: c('add'),
              onClick: () => {
                handleSaveNewImages()
              },
              styleType: 'primary-blue',
            }}
          />
        }
        layerPosition={2}
        headerContent={t('addImages')}
        isOpen={isAddImagesSideDrawerOpen}
        closeCallout={() =>
          setIsAddImagesSideDrawerOpen((prevstate) => !prevstate)
        }
      >
        <AddImagesToImageStack
          imageStackId={activeImageStack.id}
          dateAndTime={activeImageStack.dateAndTime}
          searchResults={data?.pages.flatMap((page) => page.hits) || []}
          isLoading={status === 'pending'}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          onSelect={handleImageSelection}
          selectedImageIds={selectedImageIds}
          totalImageCount={totalImageCount}
        />
      </SideDrawer>
      <PageFooter rightSection={rightSectionActions} />
      <SideDrawer
        headerContent={t('createNewImageStack')}
        isOpen={isCreateImageStackDrawerOpen}
        closeCallout={handleCloseCreateImageStackDrawer}
        footerContent={
          <FormFooter
            cancelButtonProps={{
              onClick: handleCloseCreateImageStackDrawer,
            }}
            saveButtonProps={{
              children: createStackMutation.isPending
                ? c('creating')
                : c('create'),
              onClick: () => {
                if (selectedStackGroup) {
                  const payload: CreateStackPayload = {
                    stack_group_id: selectedStackGroup.id,
                    files: [],
                    topic_id: collectionFolderId,
                  }
                  createStackMutation.mutate(payload)
                }
              },
              styleType: 'primary-blue',
              disabled: !selectedStackGroup || createStackMutation.isPending,
            }}
          />
        }
      >
        <NewSelect
          labelProps={{
            label: t('selectStackGroup'),
          }}
          required
          options={stackGroups ?? []}
          optionKeyName='id'
          labelKeyName='name'
          selectedItem={selectedStackGroup ?? defaultStackGroup}
          onChange={handleStackGroupSelect}
          placeholder={t('selectStackGroup')}
          loading={isLoading}
        />
      </SideDrawer>
      <DownloadWithVariants
        isOpen={isDownloadDrawerOpen}
        onClose={() => setIsDownloadDrawerOpen(false)}
        onDownload={(fileConfig: FileConfig) => {
          downloadVariants(fileConfig)
        }}
        variantsList={['image']}
      />
    </div>
  )
}
export default ImageStackLayout
