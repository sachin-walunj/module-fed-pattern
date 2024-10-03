'use client'

import { useEffect, useState } from 'react'

import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import moment from 'moment'

import {
  ButtonGroup,
  PageFooter,
  PrimaryTableCell,
  SortColumnProps,
  StandardTable,
  toast,
} from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import { AddListingDrawer } from './AddListing'
import { ListingsHeader } from './ListingsHeader'
import {
  assignListingFromTopic,
  getListings,
  listingObject,
  removeListingFromTopic,
} from '../../actions'

export function ListingsList({ topicId }: { topicId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [actionType, setActionType] = useState<'replace' | 'add' | 'remove'>(
    'add'
  )
  const [removeBulk, setRemoveBulk] = useState<string[]>([])
  const [replaceId, setReplaceId] = useState<string>('')
  const handleAssociateListing = () => {
    setIsOpen(true)
    setActionType('add')
  }
  const [listing, setListing] = useState<listingObject[]>([])
  const { t } = useTranslate('portal')
  const [search, setSearch] = useState<string>('')
  const [isResetCheckboxes, setIsResetCheckboxes] = useState(false)
  const [sortBy, setSortBy] = useState({
    prop: 'updated_date',
    flip: true,
  })

  const sort: SortColumnProps['sorter'] = (sortObj) => {
    setSortBy({
      prop: sortObj.activeColumn,
      flip: sortObj.direction,
    })
    refetch()
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    status,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['getListings', topicId, sortBy, search],
    queryFn: async ({ pageParam = 1 }) => {
      const payload = {
        page: pageParam ?? 1,
        limit: 20,
        sort_column: sortBy?.prop,
        sort_direction: sortBy?.flip ? 'asc' : 'desc',
        topicId: topicId,
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
      setListing(listings)
    }
  }, [data])

  const [selectedListing, setSelectedListing] = useState<
    {
      name: string
      value: string
    }[]
  >([])

  const { mutate: deleteSelectedListing } = useMutation({
    mutationFn: removeListingFromTopic,
    onSuccess: () => {
      if (actionType !== 'replace') {
        toast({
          type: 'success',
          message: t('removedListingSuccessfully'),
        })
        setTimeout(() => {
          onClose()
          refetch()
        }, 1000)
      }
    },
    onError: () => {
      toast({
        type: 'error',
        message: t('deletionFailed'),
      })
      onClose()
    },
  })

  const replaceListing = (id: string) => {
    setActionType('replace')
    setIsOpen(true)
    setReplaceId(id)
  }

  const replaceListingBulk = () => {
    const payload = {
      ids: removeBulk,
    }
    deleteSelectedListing(payload)
  }

  const onDelete = (id: string) => {
    setActionType('remove')
    const payload = {
      ids: [id],
    }
    deleteSelectedListing(payload)
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
              title={data?.name || data?.mp_primary_id}
              uniqId={{
                id: data?.listing_id,
                idLabel: 'Listing Id',
                idName: 'listing_id',
              }}
            />
          )
        },
      },
      label: 'Name',
      mainColumn: true,
      name: 'name.raw',
    },
    {
      cell: {
        children: (data: listingObject) => {
          return data.marketplace_channel_id
        },
      },
      label: t('marketplaceChannelId'),
      name: 'marketplace_channel_id',
    },

    {
      cell: {
        children: (data: listingObject) => {
          return data.mp_primary_id
        },
      },
      label: t('mpPrimaryId'),
      name: 'mp_primary_id',
    },
    {
      cell: {
        children: (data: listingObject) => {
          return data.mp_secondary_id
        },
      },
      label: t('mpSecondaryId'),
      name: 'mp_secondary_id',
    },
    {
      cell: {
        children: (data: listingObject) => {
          return moment(data.updated_date).format('YYYY-MM-DD')
        },
      },
      label: t('updatedAt'),
      name: 'updated_date',
    },
    {
      cell: {
        children: (data: listingObject) => {
          return (
            <ButtonGroup
              buttons={[
                {
                  actions: [
                    {
                      text: t('removeListingCollection'),
                      icon: 'trash',
                      callout: () => null,
                      confirmation: {
                        body: t('confirmRemoveListing'),
                        cancelButtonText: 'Cancel',
                        confirmButtonText: 'Remove',
                        confirmCallout: () => onDelete(data.id),
                        header: t('confirmTitleRemoveListing'),
                        type: 'red',
                      },
                    },
                  ],
                  placement: 'top',
                },
                {
                  children: t('edit'),
                  onClick: () => replaceListing(data.id),
                },
              ]}
            ></ButtonGroup>
          )
        },
      },
      label: '',
      name: 'action',
      noSort: true,
    },
  ]

  const onClose = () => {
    setIsOpen(false)
    setSelectedListing([])
  }

  const handleCheckboxes = (items: listingObject[]) => {
    const newList: string[] = []
    items?.map((listingItem) => newList.push(listingItem.id))
    setRemoveBulk(newList)
  }

  const { mutate: assignSelectedListing, isPending: isAssigning } = useMutation(
    {
      mutationFn: assignListingFromTopic,
      onMutate: () => {
        onClose()
      },
      onSuccess: () => {
        toast({
          type: 'success',
          message: t('assignedListingSuccessfully'),
        })
        setTimeout(() => {
          onClose()
          refetch()
        }, 1000)
      },
      onError: () => {
        toast({
          type: 'error',
          message: t('assignListingFailed'),
        })
      },
    }
  )

  const assignReplace = () => {
    const newList: string[] = []
    selectedListing?.map((listing) => newList.push(listing.value))
    const payload = {
      ids: newList,
      topic_id: topicId,
    }
    assignSelectedListing(payload)
  }

  const handleSave = () => {
    if (actionType === 'replace') {
      try {
        const payload = {
          ids: [replaceId],
        }
        deleteSelectedListing(payload)
      } catch (error) {
        toast({
          type: 'error',
          message: t('somethingWentWrong'),
        })
      } finally {
        assignReplace()
      }
    } else {
      const payload = {
        ids: [replaceId],
      }
      assignReplace()
    }
  }

  const searchCallback = (search: string) => {
    setSearch(search)
  }

  useEffect(() => {
    if (listing.length === 0) {
      setIsResetCheckboxes(true)
    } else {
      setIsResetCheckboxes(false)
    }
  }, [listing])

  return (
    <div>
      <div className='mb-16'>
        <ListingsHeader searchCallback={searchCallback} />
      </div>
      <StandardTable
        config={tableConfig}
        widthOffset={300}
        data={listing}
        dataKey='name'
        getData={() => fetchNextPage()}
        stickyTableConfig={{
          left: 1,
          right: 1,
        }}
        hasData={listing.length > 0}
        noDataFields={{
          primaryText:
            search?.length > 0 ? t('listingNotFound') : t('noDataAvailable'),
          secondaryText: t('noDataAvailableSecondary'),
          buttonProps: {
            children: t('addListing'),
            onClick: () => {
              setIsOpen(true)
              setActionType('add')
            },
          },
        }}
        successStatus={status === 'success'}
        tableId='listings_table'
        hasMore={!!(status === 'success' && hasNextPage)}
        loading={isLoading || isRefetching}
        sort={sort}
        sortBy={sortBy}
        hasCheckboxes
        handleCheckedBoxes={handleCheckboxes}
        isResetCheckboxes={isResetCheckboxes}
      />

      <PageFooter
        rightSection={[
          {
            type: 'buttonGroup',
            styleType: 'primary-blue',
            buttons: [
              {
                disabled: removeBulk.length === 0,
                actions: [
                  {
                    text: t('removeListingCollection'),
                    icon: 'trash',
                    callout: () => null,
                    confirmation: {
                      body: t('confirmRemoveListing'),
                      cancelButtonText: 'Cancel',
                      confirmButtonText: 'Remove',
                      confirmCallout: () => replaceListingBulk(),
                      header: t('confirmTitleRemoveListing'),
                      type: 'red',
                    },
                  },
                ],
              },
              {
                children: t('addListing'),
                onClick: handleAssociateListing,
              },
            ],
          },
        ]}
      />

      <AddListingDrawer
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSave}
        selectedListing={selectedListing}
        setSelectedListing={setSelectedListing}
        actionType={actionType}
      ></AddListingDrawer>
    </div>
  )
}
