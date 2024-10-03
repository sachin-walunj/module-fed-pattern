'use client'

import React from 'react'

import { APP_LOGOS, PageHeader } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

interface DocsHeaderProps {
  search: string
  setSearch: (value: string) => void
}

export const DocsHeader: React.FC<DocsHeaderProps> = ({
  search,
  setSearch,
}) => {
  const { t } = useTranslate('portal')
  return (
    <PageHeader
      search={{
        value: search,
        onChange: (searchInputText) => {
          setSearch(searchInputText)
        },
        placeholder: t('searchDocs'),
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
