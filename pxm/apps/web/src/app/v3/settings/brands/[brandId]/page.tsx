import { NextPage } from 'next'

import { BrandDetails } from '@amplifi-workspace/settings'

const BrandPage: NextPage<{ params: { brandId: string } }> = ({
  params: { brandId },
}) => {
  return <BrandDetails brandId={brandId} />
}

export default BrandPage
