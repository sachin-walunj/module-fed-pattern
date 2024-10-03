import { NextPage } from 'next'

import { Variants } from '@amplifi-workspace/home'

import { getSession } from '../../../../../../server/actions'

const VariantsPage: NextPage<{
  params: { collectionFolderId: string }
  searchParams: { variantsSearch: string }
}> = async ({
  params: { collectionFolderId },
  searchParams: { variantsSearch },
}) => {
  const session = await getSession()

  return (
    <Variants id={collectionFolderId} search={variantsSearch} user={session} />
  )
}

export default VariantsPage
