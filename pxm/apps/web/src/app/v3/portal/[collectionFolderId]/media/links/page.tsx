import React from 'react'

import { LinksLayout } from '@amplifi-workspace/home'
import { LinkMediaviewer } from '@amplifi-workspace/home'

interface ImagesPageProps {
  params: { collectionFolderId: string }

  searchParams: {
    linksSearch?: string
    activeFile?: string
  }
}

const LinksPage: React.FC<ImagesPageProps> = async ({
  params: { collectionFolderId },
  searchParams,
}) => {
  const { linksSearch, activeFile } = searchParams
  if (activeFile) {
    return (
      <LinkMediaviewer
        initialMediaId={activeFile}
        collectionFolderId={collectionFolderId}
      />
    )
  }

  return (
    <LinksLayout
      collectionFolderId={collectionFolderId}
      initialSearch={linksSearch || ''}
    />
  )
}

export default LinksPage
