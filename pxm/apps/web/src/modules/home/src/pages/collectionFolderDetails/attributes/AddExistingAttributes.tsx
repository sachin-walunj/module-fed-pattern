'use client'
import { useEffect, useState } from 'react'

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

import { FormFooter, MultiSelect, SideDrawer } from '@patterninc/react-ui'

import { Attribute } from '@amplifi-workspace/store'
import { c, useTranslate } from '@amplifi-workspace/web-shared'

import {
  searchAttribute,
  SearchAttributePayload,
} from '../../../server/actions'

interface SelectedAttribute {
  name: string
  secondaryOption: 'Boolean' | 'Text' | 'Number' | 'Date' | 'List' | 'Pick List'
  attribute?: Attribute
}
interface AddExistingAttributesDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  selectedAttributes: SelectedAttribute[]
  setSelectedAttributes: (selectedList: SelectedAttribute[]) => void
  excludeAttributes: { id?: string }[]
}

const fetchAttributes = async (
  searchValue: string,
  excludeAttributes: { id?: string }[],
  pageParam = 1
): Promise<{ attributes: Attribute[]; count: number }> => {
  const rowsPerPage = 25
  const payload: SearchAttributePayload = {
    currentPage: pageParam,
    global_settings: true,
    limit: pageParam * rowsPerPage,
    rowsPerPage: rowsPerPage,
    search: searchValue,
    sort_column: 'name',
    sort_direction: 'asc',
    start: (pageParam - 1) * rowsPerPage,
    exclude_attributes: excludeAttributes,
  }

  const searchAttrResponse = await searchAttribute(payload)
  return {
    attributes: searchAttrResponse.data,
    count: searchAttrResponse.count,
  }
}

export const AddExistingAttributesDrawer: React.FC<
  AddExistingAttributesDrawerProps
> = ({
  isOpen,
  onClose,
  onSave,
  selectedAttributes,
  setSelectedAttributes,
  excludeAttributes,
}) => {
  const { t } = useTranslate('portal')
  const queryClient = useQueryClient() // Access query client for managing cache
  const [searchValue, setSearchValue] = useState<string>('') // State for search input
  const [attributes, setAttributes] = useState<Attribute[]>([]) // State to store fetched attributes

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['attributes', searchValue],
    queryFn: ({ pageParam = 1 }) =>
      fetchAttributes(searchValue, excludeAttributes, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1
      const hasMore = nextPage <= Math.ceil(lastPage.count / 25)
      return hasMore ? nextPage : undefined
    },
    enabled: isOpen, // Only enable query when drawer is open
    initialPageParam: 1,
  })

  useEffect(() => {
    if (data) {
      // Flatten and set attributes from paginated data
      const attributes = data.pages.reduce<Attribute[]>((accumulator, page) => {
        return accumulator.concat(page.attributes)
      }, [])
      setAttributes(attributes)
    }
  }, [data])

  useEffect(() => {
    // Remove queries from cache and reset states when the drawer is closed
    return () => {
      queryClient.removeQueries({ queryKey: ['attributes', searchValue] })
      setSearchValue('')
      setAttributes([])
    }
  }, [isOpen, queryClient])

  const handleSearch = (query: string) => {
    setSearchValue(query)
    if (query !== '') {
      queryClient.removeQueries({ queryKey: ['attributes', searchValue] }) // Remove old search results
    }
  }

  const handleSelectChange = (selectedList: SelectedAttribute[]) => {
    // Map selected items to attributes and filter out those not in the current list
    const updatedAttributes = selectedList
      .map((item) => ({
        name: item.name,
        secondaryOption: item.secondaryOption,
        attribute: attributes.find((attr) => attr.label === item.name),
      }))
      .filter((item) => item.attribute)
    setSelectedAttributes([...updatedAttributes]) // Update selected attributes
  }

  return (
    <SideDrawer
      footerContent={
        <div className='flex justify-content-end'>
          <FormFooter
            cancelButtonProps={{
              children: c('cancel'),
              onClick: onClose,
            }}
            saveButtonProps={{
              styleType: 'primary-blue',
              children: t('addAttributes'),
              onClick: onSave,
              disabled: selectedAttributes.length === 0,
            }}
          />
        </div>
      }
      headerContent={t('addExistingAttributes')}
      isOpen={isOpen}
      closeCallout={onClose}
    >
      <MultiSelect
        maxHeight={'550px'}
        emptyStateProps={{
          primaryText: t('noAttributesFound'),
          secondaryText: t('trySearchingForDifferentName'),
        }}
        loading={isLoading}
        fetchData={fetchNextPage}
        hasMore={hasNextPage}
        exposed
        formLabelProps={{
          label: t('selectAttributes'),
          required: true,
          tooltip: {
            tooltipContent: t('selectOneOrMoreAttributes'),
          },
        }}
        options={attributes.map((attr: Attribute) => ({
          name: attr.label ?? '',
          secondaryOption: attr.value_type,
        }))}
        labelKey='name'
        callout={handleSelectChange}
        searchBarProps={{
          placeholder: t('searchAttributes'),
          value: searchValue,
          show: true,
          onChange: handleSearch,
        }}
        selectedOptions={selectedAttributes}
      />
    </SideDrawer>
  )
}
