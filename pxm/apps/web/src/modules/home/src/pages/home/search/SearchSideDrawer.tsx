import { useState } from 'react'

import {
  Alert,
  FormFooter,
  Picker,
  Separators,
  SideDrawer,
  TagInput,
} from '@patterninc/react-ui'

import { useQueryState, useTranslate } from '@amplifi-workspace/web-shared'

import { SearchFilterSelect } from './SearchFilterSelect'
import { SearchFilter, SearchOptionType } from './types'
import { BrowseTreeItem } from '../../../_common/types/collectionTypes'

import styles from './search.module.scss'

interface SearchSideDrawerProps {
  isOpen: boolean
  onClose: () => void
  item?: BrowseTreeItem
}
export const SearchSideDrawer: React.FC<SearchSideDrawerProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [queryAdvancedSearch, setQueryAdvancedSearch] = useQueryState<string[]>(
      {
        key: 'advancedSearch',
      }
    ),
    [queryFilters, setQueryFilters] = useQueryState<SearchFilter[]>({
      key: 'attributes',
    }),
    [querySearchOption, setQuerySearchOption] = useQueryState<SearchOptionType>(
      { key: 'option' }
    ),
    [mainSearch] = useQueryState<string>({ key: 'search' })

  const [selectedSearchOption, setSelectedSearchOption] = useState<
    SearchOptionType | undefined
  >(querySearchOption)
  const [filters, setFilters] = useState<SearchFilter[] | undefined>(
    queryFilters
  )
  const [advancedSearchTags, setAdvancedSearchTags] = useState<string[]>(
    queryAdvancedSearch ?? []
  )

  const { t } = useTranslate('portal')

  const onSave = (): void => {
    setQuerySearchOption(selectedSearchOption ?? 'exact')
    setQueryAdvancedSearch(advancedSearchTags)
    setQueryFilters(filters ?? [])

    onClose()
  }

  const onClearAll = (): void => {
    setAdvancedSearchTags([])
    setFilters(undefined)
    setSelectedSearchOption(undefined)
    setQueryAdvancedSearch(undefined)
    setQuerySearchOption(undefined)
    setQueryFilters(undefined)
  }

  interface BulkSearchOption {
    id: number
    text: string
    value: SearchOptionType
  }
  const options: BulkSearchOption[] = [
    {
      id: 1,
      text: t('exact'),
      value: 'exact',
    },
    {
      id: 2,
      text: t('keyword'),
      value: 'keyword',
    },
  ]

  //Disable the save if there is both empty search and empty filters
  const isSaveDisabled =
    advancedSearchTags.length === 0 &&
    (filters === undefined ||
      filters.length === 0 ||
      Object.keys(filters[0]).length === 0 ||
      filters[0].attribute === undefined)
  return (
    <SideDrawer
      isOpen={isOpen}
      closeCallout={onClose}
      headerContent={t('advancedSearch')}
      footerContent={
        <FormFooter
          resetButtonProps={{ children: t('clearAll'), onClick: onClearAll }}
          cancelButtonProps={{
            onClick: onClose,
          }}
          saveButtonProps={{
            onClick: onSave,
            disabled: isSaveDisabled,
            styleType: 'primary-blue',
            children: t('apply'),
          }}
        />
      }
    >
      <div className={styles.searchSideDrawerContainer}>
        {mainSearch ? (
          <Alert type='info' text={t('mainSearchAlreadyApplied')} />
        ) : null}
        <Picker
          selected={selectedSearchOption ?? 'exact'}
          labelText={t('bulkSearch')}
          options={options}
          callout={setSelectedSearchOption}
        />
        <TagInput
          tags={advancedSearchTags}
          setTags={setAdvancedSearchTags}
          placeholder={t('enterOrPasteListOfSearchTerms')}
          separators={[Separators.COMMA, Separators.ENTER]}
        />
        <SearchFilterSelect value={filters ?? [{}]} callout={setFilters} />
      </div>
    </SideDrawer>
  )
}
