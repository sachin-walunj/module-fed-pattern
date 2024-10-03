'use client'

import { APP_LOGOS, PageHeader } from '@patterninc/react-ui'

import { useQueryState, useTranslate } from '@amplifi-workspace/web-shared'

export function VariantsHeader() {
  const { t } = useTranslate('portal')
  const [search, setSearch] = useQueryState<string>({ key: 'variantsSearch' })

  return (
    <PageHeader
      search={{
        value: search ?? '',
        onChange: (searchInputText) => {
          setSearch(searchInputText ?? undefined)
        },
        placeholder: t('searchVariants'),
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
