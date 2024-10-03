import React from 'react'

import { DocsLayout } from '@amplifi-workspace/home'

interface ImagesPageProps {
  params: { collectionFolderId: string }
  searchParams: { docsSearch: string }
}

const DocsPage: React.FC<ImagesPageProps> = async ({
  params: { collectionFolderId },
  searchParams: { docsSearch },
}) => {
  return (
    <DocsLayout
      collectionFolderId={collectionFolderId}
      initialSearch={docsSearch}
    />
  )
}

export default DocsPage
