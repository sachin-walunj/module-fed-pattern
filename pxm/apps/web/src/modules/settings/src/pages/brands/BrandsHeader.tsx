'use client'

import { useEffect } from 'react'

import { PageHeader } from '@patterninc/react-ui'

import { useQueryState, useTranslate } from '@amplifi-workspace/web-shared'

import { Brand } from './types'
import { errorToast } from '../../_common/functions/errorToast'

export function BrandsHeader({
  brands,
  hasError,
}: {
  brands: Brand[]
  hasError: boolean
}) {
  const { t } = useTranslate('settings')
  const [search, setSearch] = useQueryState<string>({ key: 'search' })

  useEffect(() => {
    if (hasError) {
      errorToast(t('errorLoadingBrands'))
    }
  }, [hasError, t])

  return (
    <PageHeader
      header={{
        name: t('brands'),
        value: brands.length,
      }}
      search={{
        value: search || '',
        onChange: (value: string) => setSearch(value),
      }}
    />
  )
}
