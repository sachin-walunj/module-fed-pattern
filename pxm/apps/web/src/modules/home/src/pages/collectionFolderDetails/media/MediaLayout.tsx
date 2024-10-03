'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  Card,
  Checkbox,
  Icon,
  ListLoading,
  MediaViewer,
  MediaViewerFileProps,
  MenuActionProps,
  PageFooter,
  PageFooterProps,
  toast,
  useIsMobileView,
} from '@patterninc/react-ui'

import { useAppSelector } from '@amplifi-workspace/store'
import {
  Accordion,
  c,
  useQueryState,
  useTranslate,
} from '@amplifi-workspace/web-shared'

import { useMediaContext } from './MediaContext'
import { DownloadWithVariants } from '../../../_common/components/DownloadWithVariants'
import {
  FileConfig,
  TypesOfVariants,
} from '../../../_common/types/downloadVariantTypes'
import { GenerateDownload } from '../../../_common/utils/download'

import styles from './media-layout.module.scss'

type CardData = {
  id: string
  fileProps: {
    data: string[]
    isChecked: boolean
    name: string
    url: string
    link?: string
    created?: string
    details?: string
  }
}

type FooterAction = {
  text: string
  icon: MenuActionProps['icon']
  callout: () => void
}

type MediaViewerPrimaryAction = {
  text: string
  icon: MenuActionProps['icon']
  callout: () => void
}
export type MediaViewerData = MediaViewerFileProps & {
  id: string
  link?: string
  created?: string
  details?: string
}

type GenericMediaGalleryProps = {
  cardData: CardData[]
  mediaViewerData?: MediaViewerData[]
  headerTitle?: string
  searchPlaceholder?: string
  footerLeftButtonText?: string
  footerRightPrimaryButtonText: string
  footerRightActions: FooterAction[]
  footerRightSecondaryButtonText: string
  onSearch?: (searchText: string) => void
  onDeleteSelected: (selectedIds: string[]) => void
  onDownloadLinks?: (selectedIds: string[]) => void
  onPrimaryAction: () => void
  mediaViewerPrimaryActions?: MediaViewerPrimaryAction[]
  mediaViewerPrimaryActionText?: string
  onMediaViewerPrimaryAction?: () => void
  isLoading?: boolean
  isFetchingNextPage?: boolean
  hasNextPage?: boolean | undefined
  fetchNextPage?: () => void
  isMediaViewerDisabled?: boolean
  onCardClick?: (fileProps: {
    name: string
    url: string
    data?: string[]
    id: string
  }) => void
  isLinkTab?: boolean | false
  mediaType?: string
}

export const SharedMediaLayout: React.FC<GenericMediaGalleryProps> = ({
  cardData,
  mediaViewerData,
  mediaViewerPrimaryActions,
  mediaViewerPrimaryActionText,
  onMediaViewerPrimaryAction,
  searchPlaceholder = 'Search',
  footerLeftButtonText = 'Delete',
  footerRightPrimaryButtonText = 'Upload',
  footerRightActions,
  footerRightSecondaryButtonText = 'Download',
  onSearch,
  onDeleteSelected,
  onDownloadLinks,
  onPrimaryAction,
  // Optional props for infinite query functionality
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  isMediaViewerDisabled = false,
  onCardClick,
  isLinkTab,
  mediaType,
}) => {
  const { t } = useTranslate('portal')
  const user = useAppSelector((state) => state.user)
  const [isOpen, setIsOpen] = useState(false)
  const [activeFileIndex, setActiveFileIndex] = useState(0)
  const [isCheckAllChecked, setIsCheckAllChecked] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const isMobile = useIsMobileView()
  const downloadFile = GenerateDownload()

  const [, setActiveFile] = useQueryState<string>({
    key: 'activeFile',
    defaultValue: '',
  })

  useEffect(() => {
    setSelectedIds([])
    setIsCheckAllChecked(false)
  }, [cardData])
  const [isDownloadDrawerOpen, setIsDownloadDrawerOpen] =
    useState<boolean>(false)
  const [variantList, setVariantList] = useState<Array<string>>([])

  const handleCheckAllChange = useCallback(
    (checked: boolean) => {
      setIsCheckAllChecked(checked)
      setSelectedIds(checked ? cardData.map((card) => card.id) : [])
    },
    [cardData]
  )

  const handleCardCheckChange = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const newSelectedIds = checked
        ? [...new Set([...prev, id])] // Ensured uniqueness
        : prev.filter((selectedId) => selectedId !== id)

      return newSelectedIds
    })
  }, [])

  const safeActiveFile = useMemo(() => {
    if (!mediaViewerData || mediaViewerData.length === 0) {
      return {
        name: '',
        url: '',
        fileData: [],
        isChecked: false,
        playableFileUrl: {
          videoUrl: undefined,
          audioUrl: undefined,
        },
        id: '',
        filePath: '',
      }
    }
    const file = mediaViewerData[activeFileIndex]
    return {
      ...file,
    }
  }, [mediaViewerData, activeFileIndex])

  const mediaViewerFooterRightSection: PageFooterProps['rightSection'] = [
    {
      type: 'buttonGroup',
      buttons: [
        {
          icon: 'download',
          onClick: () => {
            setVariantList(['images', 'videos', 'files'])
            setIsDownloadDrawerOpen(true)
          },
          tooltip: {
            tooltipContent: 'Download this file',
          },
        },
        {
          icon: 'layers',
          onClick: () => {
            toast({ message: t('addToLightboxClicked'), type: 'success' })
          },
          tooltip: {
            tooltipContent: t('addToLightbox'),
          },
        },
        {
          icon: 'share2',
          onClick: () => {
            toast({ message: c('shareClicked'), type: 'success' })
          },
          tooltip: {
            tooltipContent: c('shareThisFile'),
          },
        },
      ],
    },
    {
      type: 'buttonGroup',
      styleType: 'primary-blue',
      buttons: [
        {
          actions:
            mediaViewerPrimaryActions?.map((action) => ({
              text: action.text,
              icon: action.icon,
              callout: action.callout,
            })) ?? [],
        },
        {
          children: mediaViewerPrimaryActionText,
          onClick: onMediaViewerPrimaryAction,
        },
      ],
    },
  ]

  const downloadVariants = (fileConfig: FileConfig) => {
    if (selectedIds.length) {
      // Getting the data in the rquired format
      const selectedCards = cardData
        .filter((card) => selectedIds.some((id) => id === card.id))
        .map((card) => ({
          name: card.fileProps.name,
          id: card.id,
          type: 'file',
        }))

      const payload = {
        entities: selectedCards,
        file_config: fileConfig,
        entity_type: 'file',
        role: user?.role,
        region: user?.regions.map((region) => region.id),
        wait: true,
      }

      downloadFile(payload) // API call for /file/compress
    } else {
      // Handle this case later
      toast({
        type: 'info',
        message: t('thisFeatureIsInDevelopment'),
      })
    }
    setIsDownloadDrawerOpen(false)
  }

  const rightSectionActions: PageFooterProps['rightSection'] = [
    {
      type: 'button',
      children: footerRightSecondaryButtonText,
      disabled: !selectedIds.length,
      onClick: () => {
        if (mediaType === 'links' && onDownloadLinks)
          onDownloadLinks(selectedIds)
        else {
          if (!selectedIds.length) {
            toast({
              type: 'error',
              message: t('youMustSelectAnItemFirst'),
            })
            return
          }
          if (mediaType) setVariantList([mediaType])
          else setVariantList([])
          setIsDownloadDrawerOpen(true)
        }
      },
    },
    footerRightActions.length > 0
      ? {
          type: 'buttonGroup',
          styleType: 'primary-blue',
          buttons: [
            {
              actions: footerRightActions.map((action) => ({
                text: action.text,
                icon: action.icon,
                callout: action.callout,
              })),
            },
            {
              children: footerRightPrimaryButtonText,
              onClick: onPrimaryAction,
            },
          ],
        }
      : {
          type: 'button',
          children: footerRightPrimaryButtonText,
          onClick: onPrimaryAction,
          styleType: 'primary-blue',
        },
  ]

  // Optional infinite query functionality
  // This will only be applied when isFetchingNextPage, hasNextPage, and fetchNextPage props are provided
  const isInfiniteScrollEnabled = useCallback(() => {
    return (
      isFetchingNextPage !== undefined &&
      hasNextPage !== undefined &&
      fetchNextPage !== undefined
    )
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])

  const observer = useRef<IntersectionObserver | null>(null)

  const lastCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!isInfiniteScrollEnabled() || isLoading || isFetchingNextPage) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage?.()
        }
      })
      if (node) observer.current.observe(node)
    },
    [
      isInfiniteScrollEnabled,
      isLoading,
      isFetchingNextPage,
      hasNextPage,
      fetchNextPage,
    ]
  )

  const handleCardClick = (url?: string) => {
    if (isMobile) {
      // For mobile devices,open in a new browser
      window.open(url, '_system', 'location=yes')
    } else {
      // For desktop, open in a new tab
      window.open(url, '')
    }
  }

  const getCardRef = useCallback(
    (index: number) => {
      if (isInfiniteScrollEnabled() && index === cardData.length - 1) {
        return lastCardRef
      }
      return null
    },
    [isInfiniteScrollEnabled, cardData.length, lastCardRef]
  )
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({ message: c('textCopiedToClipboard'), type: 'success' })
      })
      .catch((err) => {
        toast({ message: c('couldNotCopyTheText'), type: 'error' })
      })
  }
  const { setCurrentMediaId } = useMediaContext()
  const openMediaDetails = useCallback(
    (id: string) => {
      if (setCurrentMediaId) {
        setCurrentMediaId(id)
      } else {
        console.error('setCurrentMediaId is not available in the context')
      }

      setActiveFile(id)
    },
    [setCurrentMediaId, setActiveFile]
  )

  const handleMediaCardClick = useCallback(
    (fileProps: { name: string; url: string; data?: string[]; id: string }) => {
      if (mediaType === 'document') {
        const url = `${process.env.CLIENT_CDN_ENDPOINT}/${fileProps.id}`
        if (isMobile) {
          // For mobile devices, open in a new browser
          window.open(url, '_system', 'location=yes')
        } else {
          // For desktop, open in a new tab
          window.open(url, '')
        }
      } else {
        // For non-document types, use openMediaDetails
        openMediaDetails(fileProps.id)
      }
    },
    [mediaType, isMobile, openMediaDetails]
  )

  return (
    <div>
      {cardData.length > 0 && (
        <div className='mt-8'>
          <Checkbox
            checked={isCheckAllChecked}
            label={c('selectAll')}
            callout={() => handleCheckAllChange(!isCheckAllChecked)}
            name='checkAllCards'
          />
        </div>
      )}
      <div className={styles.cardContainer}>
        {cardData.map((card, index) => (
          <div key={card.id} ref={getCardRef(index)}>
            <Card
              fileProps={{
                ...card.fileProps,
                isChecked: selectedIds.includes(card.id),
              }}
              onCheckCallout={() =>
                handleCardCheckChange(card.id, !selectedIds.includes(card.id))
              }
              cardCallout={() =>
                handleMediaCardClick({ ...card.fileProps, id: card.id })
              }
            />
          </div>
        ))}
      </div>
      {isFetchingNextPage && (
        <div className='mt-32'>
          <ListLoading />
        </div>
      )}
      {!isMediaViewerDisabled &&
        mediaViewerData &&
        mediaViewerData?.length > 0 && (
          <MediaViewer
            files={mediaViewerData}
            file={safeActiveFile}
            checkboxProps={{
              checkboxTooltip: { children: '', tooltipContent: '' },
              infoCheckboxProps: {
                label: t('setAsPrimaryDisplay'),
                callout: () => console.log('Checked'),
              },
            }}
            activeFile={safeActiveFile}
            activeFileCallout={(file) => {
              const newIndex = mediaViewerData.findIndex(
                (f) => f.name === file.name
              )
              setActiveFileIndex(newIndex !== -1 ? newIndex : 0)
            }}
            isOpen={isOpen}
            closeCallout={() => setIsOpen(false)}
            footerButtons={
              <MediaViewer.FooterButtons
                leftSection={{
                  type: 'button',
                  as: 'button',
                  children: c('delete'),
                  styleType: 'text-red',
                  onClick: () => {
                    // Handle delete action
                    toast({ message: t('deleteClicked'), type: 'error' })
                  },
                }}
                rightSection={mediaViewerFooterRightSection}
              />
            }
            customInformationSection={
              isLinkTab ? (
                <div>
                  <Accordion title='General Information'>
                    <div className={styles['flex-container']}>
                      <span className={styles['flex-item-label']}>Title:</span>
                      <span className={styles['flex-item-content']}>
                        {mediaViewerData[activeFileIndex]?.name}
                      </span>
                    </div>

                    <div className={styles['flex-container']}>
                      <span className={styles['flex-item-label']}>
                        Created:
                      </span>
                      <span className={styles['flex-item-content']}>
                        {mediaViewerData[activeFileIndex]?.created}
                      </span>
                    </div>
                    <div className={styles['flex-container']}>
                      <span className={styles['flex-item-label']}>Link:</span>

                      <button
                        onClick={() =>
                          handleCardClick(
                            mediaViewerData[activeFileIndex]?.link || ''
                          )
                        }
                        className={styles['truncated-button']}
                      >
                        {mediaViewerData[activeFileIndex]?.link}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            mediaViewerData[activeFileIndex]?.link || ''
                          )
                        }
                      >
                        <Icon icon='clipboard'></Icon>
                      </button>
                    </div>
                  </Accordion>
                  <Accordion title='description'>
                    <div>{mediaViewerData[activeFileIndex]?.details}</div>
                  </Accordion>
                </div>
              ) : (
                <Accordion title='general information'>
                  <div></div>
                </Accordion>
              )
            }
          />
        )}
      <PageFooter
        leftSection={{
          type: 'button',
          children:
            selectedIds.length > 0
              ? `${footerLeftButtonText} (${selectedIds.length})`
              : footerLeftButtonText,
          styleType: 'text-red',
          as: 'confirmation',
          confirmation: {
            body: t(
              'areYouSureYouWantToRemoveTheSelectedFileFromThisCollection'
            ),
            type: 'red',
            header: t('confirmRemoveFiles'),
            confirmCallout: () => onDeleteSelected(selectedIds),
          },
          disabled: selectedIds.length === 0,
          tippyProps: {
            placement: 'top',
          },
        }}
        rightSection={rightSectionActions}
      />

      <DownloadWithVariants
        isOpen={isDownloadDrawerOpen}
        onClose={() => setIsDownloadDrawerOpen(false)}
        onDownload={(fileConfig: FileConfig) => {
          downloadVariants(fileConfig)
        }}
        variantsList={variantList as TypesOfVariants[]}
      />
    </div>
  )
}
