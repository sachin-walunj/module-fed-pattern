import { NextPage } from 'next'

import { UnassociatedListings } from '@amplifi-workspace/home'
//import { getSession } from '../../../../server/actions'

const ListingsPage: NextPage = async () => {
  //const session = await getSession()
  return <UnassociatedListings />
}

export default ListingsPage
