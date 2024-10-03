import React from 'react'

import { MiscLayout, NewMediaviewer } from '@amplifi-workspace/home'

interface MiscPageProps {
  params: { collectionFolderId: string }
  searchParams: {
    miscSearch: string
    activeFile?: string
  }
}

const MiscPage: React.FC<MiscPageProps> = async ({
  params: { collectionFolderId },
  searchParams,
}) => {
  const { miscSearch, activeFile } = searchParams
  if (activeFile) {
    return (
      <NewMediaviewer
        initialMediaId={activeFile}
        collectionFolderId={collectionFolderId}
        mediaType='misc'
      />
    )
  }

  return (
    <MiscLayout
      collectionFolderId={collectionFolderId}
      initialSearch={miscSearch}
    />
  )
}

export default MiscPage
