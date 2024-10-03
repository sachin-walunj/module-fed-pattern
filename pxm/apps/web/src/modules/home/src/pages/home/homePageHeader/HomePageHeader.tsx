'use client'
import { useState } from 'react'

import { PageHeader, useIsMobileView } from '@patterninc/react-ui'

import { useQueryState, useTranslate } from '@amplifi-workspace/web-shared'

import { RenderFilterChildren } from '../../../_common/components/RenderFilterChildren'
import {
  FiltersTypes as Filters,
  initialFilters,
} from '../../../_common/types/filterTypes'
import { usePageHeader } from '../../../utils/usePageHeader'
import { PredictiveSearchPopover } from '../search/predictive/PredictiveSearchPopover'
import { SearchButton } from '../search/SearchButton'

import styles from './home-header.module.scss'

export const HomePageHeader = () => {
  const [filters, setFilters] = useState(initialFilters)
  const { allFilters, updateFilters } = usePageHeader(filters, setFilters)
  const [search, setSearch] = useQueryState<string | undefined>({
    key: 'search',
  })
  const isMobileView = useIsMobileView()
  const [tempSearch, setTempSearch] = useState<string>()
  const { t } = useTranslate('portal')

  const headerText =
    filters.searchtype === 'files' ? t('fileFilters') : t('folderFilters')

  return (
    <div className={styles['homePageHeader']}>
      <PredictiveSearchPopover>
        {({ onSearch, setVisible, popoverRef }) => (
          <div
            ref={(el) => {
              if (el) {
                //Make the popover be over the search bar, not the whole header
                const parentOfSearch = el.children[0].children[0].children[0]
                popoverRef.current =
                  parentOfSearch.children[parentOfSearch.children.length - 1]
              }
            }}
          >
            <PageHeader
              search={{
                value: search ?? '',
                onChange: (searchInputText) => {
                  onSearch(searchInputText)
                  setTempSearch(searchInputText)

                  //Clear the url if the user deletes the search
                  if (searchInputText === '') {
                    setSearch(undefined)
                  }
                },
                keyUpCallout: () => {
                  setVisible(false)
                  setSearch(tempSearch)
                },
              }}
              pageFilterProps={{
                onChangeCallout: (...params) => {
                  const name = params[0] as string
                  const value = params[1]
                  updateFilters((prevState: Filters) => ({
                    ...prevState,
                    [name]: value,
                  }))
                },
                filterStates: allFilters,
                filterCallout: (...params) => {
                  console.log('Selected Filters:', filters)
                },
                resetCallout: () => {
                  // Handle resetting filter options to default here
                },
                cancelCallout: () => {
                  // Handle canceling filter options here by resetting to the previous state
                  updateFilters(filters)
                },
                appliedFilters: {}, // Define the applied filters object here
                children: RenderFilterChildren(filters, t),

                loading: false,
                noTabIndex: false,
                headerText: headerText,
                apiStatus: '',
                disabled: false,
                topChildren: false,
                disableFilterButton: false,
                hideMobileButtonText: true,
              }}
              leftSectionChildren={!isMobileView ? <SearchButton /> : null}
              hideMobileDivider
            ></PageHeader>
          </div>
        )}
      </PredictiveSearchPopover>
    </div>
  )
}
