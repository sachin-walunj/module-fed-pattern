import { NextPage } from 'next'

import { Listings } from '@amplifi-workspace/home'

import { getSession } from '../../../../../../server/actions'

const ListingsPage: NextPage<{
  params: { collectionFolderId: string }
  searchParams: { variantsSearch: string }
}> = async ({
  params: { collectionFolderId },
  searchParams: { variantsSearch },
}) => {
  const session = await getSession()
  return (
    <Listings id={collectionFolderId} search={variantsSearch} user={session} />
  )
}

export default ListingsPage
