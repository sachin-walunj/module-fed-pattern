'use client'
import {
  SortByProps,
  SortColumnProps,
  StandardTable,
} from '@patterninc/react-ui'

import { useQueryState, useTranslate } from '@amplifi-workspace/web-shared'

import { brandsTableConfig } from './BrandsTableConfig'
import { Brand } from '../types'

export function BrandsTable({ brands }: { brands: Brand[] }) {
  const { t } = useTranslate('settings')
  const [sortBy, setSortBy] = useQueryState<SortByProps>({
    key: 'sort',
    defaultValue: { prop: 'name', flip: true },
  })
  const sort: SortColumnProps['sorter'] = ({ activeColumn, direction }) => {
    setSortBy({ prop: activeColumn, flip: direction })
  }
  return (
    <StandardTable
      dataKey='name'
      tableId='brands-table'
      data={brands}
      getData={() => null}
      config={brandsTableConfig({ sortBy })}
      sortBy={sortBy}
      sort={sort}
      hasData={brands?.length > 0}
      loading={false}
      successStatus
      hasMore={false}
      noDataFields={{
        primaryText: t('noBrandsFound'),
        secondaryText: t('addANewBrandToGetStarted'),
      }}
    />
  )
}
