import { NextPage } from 'next'

import { redirect } from 'next/navigation'

import { useServerToggle } from '@amplifi-workspace/static-shared'

const Page: NextPage = async () => {
  const brandsEnabled = await useServerToggle('add_brands_to_pxm')

  const url = brandsEnabled ? '/settings/brands' : '/portal'
  return redirect(`${process.env.ROUTE_PREFIX_V3}${url}`)
}

export default Page
