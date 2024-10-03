'use client'

import { useState } from 'react'

import { APP_LOGOS, PageHeader } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

export function UnassociatedListingsHeader({
  searchCallback,
}: {
  searchCallback: (search: string) => void
}) {
  const { t } = useTranslate('portal')
  const [search, setSearch] = useState<string>('')

  return (
    <PageHeader
      search={{
        value: search ?? '',
        onChange: (searchInputText) => {
          setSearch(searchInputText ?? undefined)
          searchCallback?.(searchInputText ?? '')
        },
        placeholder: t('searchListings'),
      }}
      leftSectionChildren={
        <div className='flex gap-16'>
          <img
            src={APP_LOGOS.PXM.logo}
            alt='Logo'
            style={{
              width: '150px',
            }}
          />
          <PageHeader.HeaderDivider />
        </div>
      }
    />
  )
}
