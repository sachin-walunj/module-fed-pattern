import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { NewSelect } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import { getAttributes, GetAttributesProps } from './DataLayer'
import { SearchAttribute } from './types'

interface SearchAttributeSelectProps {
  value: SearchAttribute | undefined
  callout: (value: SearchAttribute) => void
}
export const SearchAttributeSelect: React.FC<SearchAttributeSelectProps> = ({
  value,
  callout,
}) => {
  const { options, loading, onSearch, hasMore, getData } =
    useAttributeOptionsWithSearch()
  const { t } = useTranslate('portal')

  return (
    <NewSelect
      labelProps={{
        label: t('attribute'),
      }}
      required
      options={options}
      optionKeyName='id'
      labelKeyName='name'
      selectedItem={value || { id: '0', name: t('selectAttribute') }}
      onChange={callout}
      loading={loading}
      searchBarProps={{ showSearchBar: true, onChange: onSearch }}
      scrollProps={{
        hasMore,
        getData,
      }}
    />
  )
}

const useAttributeOptionsWithSearch = (): {
  options: SearchAttribute[]
  loading: boolean
  onSearch: (value: string) => void
  hasMore: boolean
  getData: () => void
} => {
  const [loading, setLoading] = useState(true)
  const [options, setOptions] = useState<SearchAttribute[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(1)
  const [search, setSearch] = useState<string | undefined>()
  const concurrentRequests = useRef(0)

  const count = 20

  const fetchOptions = useCallback(
    async ({
      merge,
      ...payload
    }: Pick<GetAttributesProps, 'page' | 'search'> & {
      merge: boolean
    }): Promise<void> => {
      //Only set the loading state if this is the first page
      setLoading(payload.page <= 1)
      concurrentRequests.current += 1
      const { options: newOptions, total } = await getAttributes({
        ...payload,
        start: (page - 1) * count,
        end: page * count,
      })
      //Only set the options if this is the last request
      if (concurrentRequests.current === 1) {
        if (merge) {
          setOptions((prev) => [...prev, ...newOptions])
        } else {
          setOptions(newOptions)
        }
        setTotal(total)
        setPage(page + 1)
        setLoading(false)
      }
      concurrentRequests.current -= 1
    },
    [setOptions, page]
  )

  useEffect(() => {
    fetchOptions({ merge: false, page })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- We want this to run on mount, so no dependencies
  }, [])

  const onSearch = useCallback(
    (value: string): void => {
      // Reset the page to 1 when searching
      fetchOptions({ merge: false, search: value, page: 1 })
      setPage(1)
      setSearch(value ?? undefined)
    },
    [fetchOptions]
  )

  const hasMore = useMemo(() => options.length < total, [total, options])

  const getData = useCallback(() => {
    fetchOptions({ merge: true, page, search })
  }, [fetchOptions, page, search])

  return {
    options,
    hasMore,
    getData,
    loading,
    onSearch,
  }
}
