import { NextPage } from 'next'

import { AttributesTab } from '@amplifi-workspace/home'

const AttributesPage: NextPage<{
  params: { collectionFolderId: string }
  searchParams: { attributesSearch: string }
}> = async ({
  params: { collectionFolderId },
  searchParams: { attributesSearch },
}) => {
  return <AttributesTab id={collectionFolderId} search={attributesSearch} />
}

export default AttributesPage
