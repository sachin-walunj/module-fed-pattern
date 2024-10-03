import { BrandSideBar } from './BrandSideBar'
import { StyleGuide } from './detailsCards/StyleGuide'
import { getBrand } from '../actions'
import { Brand } from '../types'

import styles from './brand-details.module.scss'

export async function BrandDetails({ brandId }: { brandId: string }) {
  let brand: Brand | null = null
  let hasError = false
  try {
    brand = await getBrand(brandId)
  } catch (error) {
    hasError = true
  }
  return (
    <div className={styles.container}>
      <BrandSideBar brand={brand} hasError={hasError} />

      <div className={styles.layout}>
        <div>Placeholder for Brand voice</div>
        <StyleGuide styleGuide={undefined} id={brand?.id || ''} />
      </div>
    </div>
  )
}
