'use client'

import { useContext, useEffect, useState } from 'react'

import moment from 'moment'
import { usePathname } from 'next/navigation'

import {
  BreadcrumbType,
  Checkbox,
  IconStringList,
  PageFooter,
  TagProps,
  toast,
  trimText,
  useIsMobileView,
  useToggle,
} from '@patterninc/react-ui'

import {
  AppDispatch,
  SelectedProduct,
  setSelectedProducts,
  toggleLightboxDrawer,
  useAppDispatch,
  useAppSelector,
} from '@amplifi-workspace/store'
import {
  BreadcrumbContext,
  c,
  Divider,
  PopoverDisplay,
  useQueryState,
  useTranslate,
} from '@amplifi-workspace/web-shared'

import { ContentBriefSideDrawer } from './batchActions/ContentBriefSideDrawer'
import { FileUploadDrawer } from './fileUpload/FileUploadDrawer'
import ProductListings from './productsListings/productsListings'
import {
  CollectionCard,
  CollectionCardType,
} from '../../../_common/components/CollectionCard/CollectionCard'
import { DownloadWithVariants } from '../../../_common/components/DownloadWithVariants'
import { useCollectionCardCheckboxes } from '../../../_common/hooks/UseCollectionCardCheckboxes'
import { CategoryHierarchyResponse } from '../../../_common/types/categoryHierarchyTypes'
import { Collection } from '../../../_common/types/collectionTypes'
import { FileConfig } from '../../../_common/types/downloadVariantTypes'
import { GenerateDownload } from '../../../_common/utils/download'
import { ROOT_LEVEL_BREADCRUMBS } from '../home'

import styles from './folder-details-content.module.scss'

type SelectDisplayOption = {
  name: string
  label: string
}

export function FolderDetailsContent({
  collections,
  totalItems,
  categoryHierarchy,
}: {
  collections: Collection[]
  totalItems: number
  categoryHierarchy: CategoryHierarchyResponse | null
}) {
  const generateContentBriefToggle = useToggle('generate_content_brief_from_v3')

  const dispatch: AppDispatch = useAppDispatch()
  const [currentPage, setCurrentPage] = useQueryState<number>({
    key: 'page',
    defaultValue: 1,
  })
  const [selectedOption, setSelectedOption] = useState('A to Z')
  const isMobileView = useIsMobileView()
  const user = useAppSelector((state) => state.user)
  const [, setCurrentSort] = useQueryState<string>({
    key: 'sort',
    defaultValue: 'alphabetical',
  })
  const [cardsPerPage, setCardsPerPage] = useQueryState<number>({
    key: 'perPage',
    defaultValue: 25,
  })
  const [isFileUploadOpen, setIsFileUploadOpen] = useState<boolean>(false)
  const { t } = useTranslate('portal')
  const downloadFiles = GenerateDownload()
  const { updateBreadcrumbs } = useContext(BreadcrumbContext)
  const currentPath = usePathname()
  const [isDownloadDrawerOpen, setIsDownloadDrawerOpen] =
    useState<boolean>(false)
  const [downloadData, setDownloadData] = useState<Array<CollectionCardType>>(
    []
  )
  const [generateContentBriefDrawerOpen, setGenerateContentBriefDrawerOpen] =
    useState(false)

  const downloadVariants = (fileConfig: FileConfig) => {
    const payload = {
      entities: downloadData.map(({ name, id, type }) => ({
        name,
        id,
        type,
      })),
      file_config: fileConfig,
      entity_type: 'topic',
      role: user?.role,
      region: user?.regions.map((region) => region.id),
      wait: false,
    }

    downloadFiles(payload) // API call for /file/compress

    setIsDownloadDrawerOpen(false)
  }

  useEffect(() => {
    if (categoryHierarchy?.hierarchy) {
      const hierarchyBreadcrumbs: BreadcrumbType[] = categoryHierarchy.hierarchy
        .slice(1)
        .map((item) => ({
          name: item.name,
          link: `/v3/portal?folderId=${encodeURIComponent(
            JSON.stringify(item.id)
          )}`,
          changeType: 'tab' as const,
        }))

      updateBreadcrumbs([...ROOT_LEVEL_BREADCRUMBS, ...hierarchyBreadcrumbs])
    }
  }, [currentPath, categoryHierarchy, updateBreadcrumbs])

  const [numUploadsInProgress, setNumUploadsInProgress] = useState(0)
  const [numUploadsComplete, setNumUploadsComplete] = useState(0)

  const {
    checkAll,
    checkAllCallout,
    collectionCards,
    onCheckCallout,
    checkedCards,
  } = useCollectionCardCheckboxes({ data: collections })

  const handleOptionClick = (option: SelectDisplayOption) => {
    setSelectedOption(option.name)
    let sortValue: string
    switch (option.name) {
      case 'A to Z':
        sortValue = 'alphabetical'
        break
      case 'Z to A':
        sortValue = 'alphabetical_desc'
        break
      case 'Newest':
        sortValue = 'date_added_desc'
        break
      case 'Oldest':
        sortValue = 'date_added_asc'
        break
      case 'Relevance':
        sortValue = 'relevance'
        break
      default:
        sortValue = 'alphabetical'
    }
    setCurrentSort(sortValue)
  }

  const toggleAddToLightboxDrawer = () => {
    // If No cards selected, show toast message
    if (!checkedCards.length) {
      toast({
        type: 'error',
        message: 'You must select an item first.',
      })
      return
    }
    // Clear previous selections (if needed)
    const selectedProducts: SelectedProduct[] = checkedCards.map((card) => ({
      id: card.id,
      name: card.name,
      type: card.type || 'topic',
    }))

    // Set the selected products in the Redux store
    dispatch(setSelectedProducts(selectedProducts))

    // Open the lightbox drawer
    dispatch(toggleLightboxDrawer({ parent: 'AddToLightbox' }))
  }

  const [isOpenProductsListings, setIsOpenProductsListings] = useState(false)
  const bulkActionAssociateListing = () => {
    // If No cards selected, show toast message
    if (!checkedCards.length) {
      toast({
        type: 'error',
        message: 'You must select an item first.',
      })
      return
    }
    if (checkedCards.length > 1) {
      toast({
        type: 'error',
        message: 'More than one item selection is not allowed.',
      })
      return
    }
    setIsOpenProductsListings(true)
  }

  const downloadCheckedItems = () => {
    // If No cards selected, show toast message
    if (!checkedCards.length) {
      toast({
        type: 'error',
        message: t('youMustSelectAnItemFirst'),
      })
      return
    }
    setDownloadData(checkedCards)
    setIsDownloadDrawerOpen(true)
  }

  if (!collectionCards.length) {
    return <div>No data found</div>
  }

  const totalPages = Math.ceil(totalItems / cardsPerPage)

  const handleCardsPerPageClick = (option: SelectDisplayOption) => {
    const newSize = parseInt(option.name)
    setCardsPerPage(newSize)
    setCurrentPage(1)
  }

  function generateCollectionDetails(card: Collection): string[] {
    return [
      trimText(card.additional_title, 30),
      `ADDED: ${moment(card.created_date).format('MM/DD/YYYY @ h:mm A')}`,
    ]
  }

  const isContentBriefGenerateable =
    checkedCards.length === 1 &&
    checkedCards[0].attributes.value_text.some(
      (attr) => attr.label === 'external_product_id - en-US'
    ) &&
    checkedCards[0].attributes.value_text.some(
      (attr) => attr.label === 'external_product_id_type - en-US'
    )

  return (
    <>
      <div className={styles.subheader}>
        <div className='flex'>
          {!isMobileView && (
            <div className={styles.resultCount}>
              Showing: {totalItems} Results
            </div>
          )}
          {!isMobileView && (
            <div className='mr-8'>
              <Divider />
            </div>
          )}
          <Checkbox
            checked={checkAll}
            label='Select All'
            callout={(_, check: boolean) => checkAllCallout(check)}
            name='checkAllCards'
            stateName='isCheckAllChecked'
          />
        </div>
        <div className={styles.rightSection}>
          <div className={styles.sortContainer}>
            {!isMobileView && <span className={styles.text}>SORT</span>}
            {isMobileView && <span className={styles.text}>SORT/RESULTS</span>}
            <PopoverDisplay
              options={[
                { label: 'Alphabetical: 0-9 and A to Z', name: 'A to Z' },
                { label: 'Alphabetical: 9 to 0 and Z to A', name: 'Z to A' },
                { label: 'Newest Added', name: 'Newest' },
                { label: 'Oldest Added', name: 'Oldest' },
                { label: 'Relevance', name: 'Relevance' },
              ]}
              onOptionClick={handleOptionClick}
              initialSelectedOption={selectedOption}
            />
          </div>
          <div className={styles.resultsContainer}>
            {!isMobileView && <span className={styles.text}>RESULTS/PAGE</span>}
            <PopoverDisplay
              options={[
                { label: '25', name: '25' },
                { label: '50', name: '50' },
                { label: '75', name: '75' },
                { label: '100', name: '100' },
                { label: '200', name: '200' },
                { label: '500', name: '500' },
                { label: '1000', name: '1000' },
              ]}
              onOptionClick={handleCardsPerPageClick}
              initialSelectedOption={cardsPerPage.toString()}
            />
          </div>
        </div>
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.container}>
          {collectionCards.map((card) => {
            const tagContent =
              card.collection_type === 'variant'
                ? c('variant')
                : card.collection_type === 'parent'
                ? c('parent')
                : undefined
            const tags: TagProps[] = tagContent
              ? [{ children: tagContent, color: 'gray' }]
              : []

            return (
              <div key={card.id} className={styles.cardWrapper}>
                <CollectionCard
                  card={card}
                  onCheckCallout={onCheckCallout}
                  tags={tags}
                  collectionDetails={generateCollectionDetails(card)}
                  onDownload={(isOpen, data) => {
                    setIsDownloadDrawerOpen(isOpen)
                    setDownloadData(data)
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
      <FileUploadDrawer
        isOpen={isFileUploadOpen}
        setIsOpen={setIsFileUploadOpen}
        numUploadsInProgress={numUploadsInProgress}
        setNumUploadsInProgress={setNumUploadsInProgress}
        numUploadsComplete={numUploadsComplete}
        setNumUploadsComplete={setNumUploadsComplete}
      />
      <ProductListings
        closeCallback={() => setIsOpenProductsListings(false)}
        isOpen={isOpenProductsListings}
        topicId={checkedCards?.[0]?.id}
      ></ProductListings>
      <DownloadWithVariants
        isOpen={isDownloadDrawerOpen}
        onClose={() => setIsDownloadDrawerOpen(false)}
        onDownload={(fileConfig: FileConfig) => downloadVariants(fileConfig)}
        variantsList={['image', 'video', 'misc', 'document']}
      />
      {generateContentBriefToggle ? (
        <ContentBriefSideDrawer
          isOpen={generateContentBriefDrawerOpen}
          closeCallout={() => setGenerateContentBriefDrawerOpen(false)}
          collection={checkedCards[0]}
        />
      ) : null}
      <PageFooter
        leftSection={{
          callout: (page) => setCurrentPage(page),
          currentPage: currentPage,
          totalPages: totalPages,
          type: 'pagination',
        }}
        rightSection={[
          {
            buttons: [
              {
                actions: [
                  {
                    callout: toggleAddToLightboxDrawer,
                    icon: 'plus',
                    text: 'Add to Lightbox',
                  },
                  {
                    callout: bulkActionAssociateListing,
                    icon: 'link',
                    text: t('associateListing'),
                  },
                  {
                    callout: downloadCheckedItems,
                    icon: 'download',
                    text: c('download'),
                  },
                  ...(generateContentBriefToggle && checkedCards.length === 1
                    ? [
                        {
                          callout: () =>
                            setGenerateContentBriefDrawerOpen(true),
                          icon: 'ai' as IconStringList,
                          text: t('generateContentBrief'),
                          disabled: {
                            value: !isContentBriefGenerateable,
                            tooltip: {
                              tooltipContent: t('productDoesNotHaveExternalId'),
                            },
                          },
                        },
                      ]
                    : []),
                ],
              },
              {
                children: ' Batch Actions',
                onClick: () => {
                  console.log('Batch Actions Callout')
                },
              },
            ],
            styleType: 'primary-blue',
            type: 'buttonGroup',
          },
          {
            type: 'button',
            children: t('uploadImport'),
            onClick: () => {
              setIsFileUploadOpen(true)
            },
            styleType: 'primary-blue',
          },
        ]}
      />
    </>
  )
}
