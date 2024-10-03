import { NextPage } from 'next'

import { SortByProps } from '@patterninc/react-ui'

import { BrandsTab } from '@amplifi-workspace/settings'

const BrandsPage: NextPage<{
  params: { search: string; sort: string }
}> = ({ params: { search, sort } }) => {
  const parsedSort = sort
    ? (JSON.parse(sort) as SortByProps)
    : { prop: 'name', flip: true }
  const parsedSearch = search ? JSON.parse(search) : ''
  return <BrandsTab search={parsedSearch} sort={parsedSort} />
}

export default BrandsPage
