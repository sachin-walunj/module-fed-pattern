import { SortByProps } from '@patterninc/react-ui'

import { getBrands } from './actions'
import { BrandsFooter } from './BrandsFooter'
import { BrandsHeader } from './BrandsHeader'
import { BrandsTable } from './brandsTable/BrandsTable'
import { Brand } from './types'

export async function BrandsTab({
  search,
  sort,
}: {
  search: string
  sort: SortByProps
}) {
  let brands: Brand[] = []
  let hasError = false
  try {
    brands = await getBrands({ search, sort })
  } catch (error) {
    hasError = true
  }
  return (
    <div>
      <div className='mb-16'>
        <BrandsHeader brands={brands} hasError={hasError} />
      </div>
      <BrandsTable brands={brands} />
      <BrandsFooter />
    </div>
  )
}
