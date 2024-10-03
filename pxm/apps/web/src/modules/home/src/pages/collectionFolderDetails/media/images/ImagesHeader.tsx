'use client'

import { APP_LOGOS, PageHeader } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

interface ImagesHeaderProps {
  search: string
  setSearch: (value: string) => void
}

export const ImagesHeader: React.FC<ImagesHeaderProps> = ({
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
        placeholder: t('searchImages'),
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
