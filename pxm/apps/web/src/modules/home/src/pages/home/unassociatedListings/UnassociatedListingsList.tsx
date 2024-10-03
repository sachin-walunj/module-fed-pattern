'use client'

import { useCallback, useContext, useEffect, useState } from 'react'

import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import moment from 'moment'

import {
  BreadcrumbType,
  Button,
  PageFooter,
  PrimaryTableCell,
  SideDrawer,
  SortColumnProps,
  StandardTable,
  toast,
} from '@patterninc/react-ui'

import {
  BreadcrumbContext,
  c,
  useTranslate,
} from '@amplifi-workspace/web-shared'

import { UnassociatedListingsHeader } from './UnassociatedListingsHeader'
import { BrowseTreeItem } from '../../../_common/types/collectionTypes'
import {
  assignListingFromTopic,
  getListings,
  listingObject,
} from '../../collectionFolderDetails/actions'
import { CollectionTreeView } from '../categoryFolderPicker/collections/CollectionTreeView'
import { ROOT_LEVEL_BREADCRUMBS } from '../home'

import styles from './unassociatedListings.module.scss'

interface newListTypes {
  ids: string[]
  topic_id: string | undefined
}
export function UnassociatedListingsList() {
  const [isOpen, setIsOpen] = useState(false)
  const [listingData, setListingData] = useState<listingObject[]>([])
  const [selectedTopic, setSelectedTopic] = useState<BrowseTreeItem>()
  const [search, setSearch] = useState<string>('')
  const [sortBy, setSortBy] = useState({
    prop: 'updated_date',
    flip: true,
  })
  const { updateBreadcrumbs } = useContext(BreadcrumbContext)
  const updateBreadcrumbsOnDetailsLayout = useCallback(() => {
    const newBreadcrumbs: BreadcrumbType[] = [
      {
        name: 'Unassociated Listings',
        link: `/v3/portal?folderId=${encodeURIComponent(
          JSON.stringify('listing')
        )}`,
        changeType: 'tab',
      },
    ]
    updateBreadcrumbs([...ROOT_LEVEL_BREADCRUMBS, ...newBreadcrumbs])
  }, [updateBreadcrumbs])

  useEffect(() => {
    // Set root-level breadcrumbs
    updateBreadcrumbsOnDetailsLayout()
  }, [updateBreadcrumbsOnDetailsLayout])

  const sort: SortColumnProps['sorter'] = (sortObj) => {
    setSortBy({
      prop: sortObj.activeColumn,
      flip: sortObj.direction,
    })
    refetch()
  }
  const handleCollectionDrawer = () => {
    setIsOpen(true)
  }
  const { t } = useTranslate('portal')

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    status,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['getListings', sortBy, search],
    queryFn: async ({ pageParam = 1 }) => {
      const payload = {
        page: pageParam ?? 1,
        limit: 20,
        sort_column: sortBy?.prop,
        sort_direction: sortBy?.flip ? 'asc' : 'desc',
        search: search,
      }
      const response = await getListings(payload)
      return response
    },
    initialPageParam: 1,

    getNextPageParam: (previousResponse) => {
      return previousResponse?.pagination?.last_page
        ? undefined
        : previousResponse?.pagination?.next_page
    },
  })

  useEffect(() => {
    if (data) {
      const listings = data.pages.reduce<listingObject[]>(
        (accumulator, page) => {
          return accumulator.concat(page.data)
        },
        []
      )
      setListingData(listings)
    }
  }, [data])

  const onItemClick = (item: BrowseTreeItem): void => {
    if (item.type === 'topic') {
      setSelectedTopic(item)
    } else {
      setSelectedTopic(undefined)
    }
  }
  const [selectedListings, setSelectedListings] = useState<string[]>([])
  const [singleListing, setSingleListing] = useState<string[]>([])
  const handleCheckboxes = (items: listingObject[]) => {
    const newList: string[] = []
    items?.map((listingItem) => newList.push(listingItem.id))
    setSelectedListings(newList)
  }

  const tableConfig = [
    {
      cell: {
        children: (data: listingObject) => {
          return (
            <PrimaryTableCell
              sortBy={{
                order: 'asc',
                prop: 'name',
              }}
              title={data?.name}
              uniqId={{
                id: data?.listing_id,
                idLabel: 'Listing Id',
                idName: 'listing_id',
              }}
            />
          )
        },
      },
      label: 'Listing',
      mainColumn: true,
      name: 'name',
    },
    {
      cell: {
        children: (data: listingObject) => {
          return data.marketplace_channel_id
        },
      },
      label: 'Marketplace Channel Id',
      name: 'marketplace_channel_id',
    },

    {
      cell: {
        children: (data: listingObject) => {
          return data.mp_primary_id
        },
      },
      label: 'Primary Id',
      name: 'mp_primary_id',
    },
    {
      cell: {
        children: (data: listingObject) => {
          return data.mp_secondary_id
        },
      },
      label: 'Secondary Id',
      name: 'mp_secondary_id',
    },
    {
      cell: {
        children: (data: listingObject) => {
          const formattedDate = moment(data?.updated_date).format('LL') // e.g., "January 1, 2020"
          const formattedTime = moment(data?.updated_date).format('LT') // e.g., "1:00 PM"
          return (
            <div className='flex flex-direction-column'>
              <span
                className={sortBy.prop === 'updated_date' ? 'fw-semi-bold' : ''}
              >
                {formattedDate}
              </span>
              <span className='fs-12 fc-purple'>{formattedTime}</span>
            </div>
          )
        },
      },
      label: 'Updated At',
      name: 'updated_date',
    },
    {
      cell: {
        children: (data: listingObject) => {
          //setSelectedListings([data.id])
          return (
            <Button
              as='button'
              styleType='tertiary'
              onClick={() => {
                setSingleListing([data.id])
                handleCollectionDrawer()
              }}
            >
              {t('attachToCollection')}
            </Button>
          )
        },
      },
      label: '',
      name: 'action',
      noSort: true,
    },
  ]

  const onClose = () => {
    setSingleListing([])
    setSelectedTopic(undefined)
    setIsOpen(false)
  }

  const { mutate: assignSelectedListing } = useMutation({
    mutationFn: assignListingFromTopic,
    onMutate: () => {
      onClose()
    },
    onSuccess: () => {
      toast({
        type: 'success',
        message: t('assignedCollectionSuccessfully'),
      })
      setTimeout(() => {
        onClose()
        refetch()
      }, 1000)
    },
    onError: () => {
      toast({
        type: 'error',
        message: t('assignCollectionFailed'),
      })
    },
  })

  const onSave = () => {
    const payload: newListTypes = {
      ids: singleListing.length > 0 ? singleListing : selectedListings,
      topic_id: selectedTopic?.id,
    }
    assignSelectedListing(payload)
  }

  const searchCallback = (search: string) => {
    setSearch(search)
  }

  return (
    <div>
      <div className='mb-16'>
        <UnassociatedListingsHeader searchCallback={searchCallback} />
      </div>
      <StandardTable
        config={tableConfig}
        data={listingData}
        dataKey='id'
        getData={() => fetchNextPage()}
        hasCheckboxes
        stickyTableConfig={{
          left: 1,
          right: 1,
        }}
        hasData={listingData.length > 0}
        noDataFields={{
          primaryText:
            search?.length > 0 ? t('listingNotFound') : t('noDataAvailable'),
          secondaryText: t('noDataAvailableSecondary'),
        }}
        successStatus={status === 'success'}
        tableId='unassociatedlistings_table'
        hasMore={!!(status === 'success' && hasNextPage)}
        loading={isLoading || isRefetching}
        sort={sort}
        sortBy={sortBy}
        handleCheckedBoxes={handleCheckboxes}
      />

      <PageFooter
        rightSection={[
          {
            children: t('attachToCollection'),
            onClick: handleCollectionDrawer,
            disabled: selectedListings.length === 0,
            type: 'button',
            styleType: 'primary-blue',
          },
        ]}
      />

      <SideDrawer
        headerContent='Select a Collection'
        isOpen={isOpen}
        closeCallout={onClose}
        contentClassName={styles.sideDrawerContent}
        noContentPadding={true}
        footerContent={
          <div className={styles.sideDrawerFooter}>
            <Button
              styleType='primary-blue'
              onClick={onSave}
              disabled={selectedTopic?.type !== 'topic'}
            >
              {c('save')}
            </Button>
          </div>
        }
      >
        <CollectionTreeView
          onItemClick={onItemClick}
          parent={'Unassociated Listings'}
        />
      </SideDrawer>
    </div>
  )
}
