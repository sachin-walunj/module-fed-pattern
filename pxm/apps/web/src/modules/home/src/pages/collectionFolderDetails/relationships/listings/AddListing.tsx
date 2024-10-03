'use client'
import { useEffect, useState } from 'react'

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

import { FormFooter, MultiSelect, SideDrawer } from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import {
  getUnAssociateListing,
  listingObject,
  UnAssociateListingPayload,
} from '../../actions'

export interface SelectedListing {
  name: string
  value: string
}
interface AddListingDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  selectedListing: SelectedListing[]
  setSelectedListing: (selectedList: SelectedListing[]) => void
  actionType: 'replace' | 'add' | 'remove'
  isProceessing?: boolean
}

const fetchListing = async (
  searchValue: string,
  pageParam = 1
): Promise<{ listings: listingObject[]; count: number }> => {
  const rowsPerPage = 20
  const payload: UnAssociateListingPayload = {
    currentPage: pageParam,
    limit: pageParam * rowsPerPage,
    rowsPerPage: rowsPerPage,
    search: searchValue,
    sort_column: 'name',
    sort_direction: 'asc',
  }

  const searchAttrResponse = await getUnAssociateListing(payload)
  return {
    listings: searchAttrResponse.data,
    count: searchAttrResponse.pagination?.count,
  }
}

export const AddListingDrawer: React.FC<AddListingDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedListing,
  setSelectedListing,
  actionType,
  isProceessing,
}) => {
  const queryClient = useQueryClient()
  const [searchValue, setSearchValue] = useState<string>('')
  const [listings, setListings] = useState<listingObject[]>([])
  const { t } = useTranslate('portal')
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['listings', searchValue],
    queryFn: ({ pageParam = 1 }) => fetchListing(searchValue, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1
      const hasMore = nextPage <= Math.ceil(lastPage.count / 20)
      return hasMore ? nextPage : undefined
    },
    enabled: isOpen,
    initialPageParam: 1,
  })

  useEffect(() => {
    if (data) {
      // Flatten and set attributes from paginated data
      const listings = data.pages.reduce<listingObject[]>(
        (accumulator, page) => {
          return accumulator.concat(page.listings)
        },
        []
      )
      setListings(listings)
    }
  }, [data])

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['listings', searchValue] })
      setSearchValue('')
      setListings([])
    }
  }, [isOpen, queryClient])

  const handleSearch = (query: string) => {
    setSearchValue(query)
    if (query !== '') {
      queryClient.removeQueries({ queryKey: ['listings', searchValue] })
    }
  }

  const handleSelectChange = (selectedList: SelectedListing[]) => {
    setSelectedListing(selectedList)
  }

  return (
    <SideDrawer
      footerContent={
        <div className='flex justify-content-end'>
          <FormFooter
            cancelButtonProps={{
              children: 'Cancel',
              onClick: onClose,
            }}
            saveButtonProps={{
              styleType: 'primary-blue',
              children: c('save'),
              onClick: onSave,
              disabled:
                actionType === 'replace'
                  ? selectedListing.length > 1 || selectedListing.length === 0
                  : selectedListing.length === 0 || isProceessing,
            }}
          />
        </div>
      }
      headerContent={t('associateListings')}
      isOpen={isOpen}
      closeCallout={onClose}
    >
      <MultiSelect
        maxHeight={'550px'}
        emptyStateProps={{
          primaryText: t('associateListingNotFound'),
          secondaryText: t('trySearchingForDifferentName'),
        }}
        loading={isLoading}
        fetchData={fetchNextPage}
        hasMore={hasNextPage}
        exposed
        formLabelProps={{
          label: t('unassociatedListingsLabel'),
          required: true,
          tooltip: {
            tooltipContent: t('unassociatedListingsTooltip'),
          },
        }}
        //  TODO: Fix this in upcoming PR
        options={listings.map((listing: any) => {
          return {
            name: listing?.name || listing?.mp_primary_id,
            value: listing.id,
          }
        })}
        labelKey='name'
        callout={handleSelectChange}
        searchBarProps={{
          placeholder: t('searchUnassociatedListing'),
          value: searchValue,
          show: true,
          onChange: handleSearch,
        }}
        selectedOptions={selectedListing}
      />
    </SideDrawer>
  )
}
