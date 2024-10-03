import { NextPage } from 'next'

import { redirect } from 'next/navigation'

const Page: NextPage = () => {
  return redirect(`${process.env.ROUTE_PREFIX_V3}/portal`)
}
export default Page
