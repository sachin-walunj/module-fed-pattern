import React from 'react'

import { NextPage } from 'next'

import { NewMediaviewer, VideosLayout } from '@amplifi-workspace/home'

interface ImagesPageProps {
  params: { collectionFolderId: string }
  searchParams: {
    videosSearch: string
    activeFile?: string
  }
}

const VideosPage: NextPage<ImagesPageProps> = async ({
  params: { collectionFolderId },
  searchParams,
}) => {
  const { videosSearch, activeFile } = searchParams
  if (activeFile) {
    return (
      <NewMediaviewer
        initialMediaId={activeFile}
        collectionFolderId={collectionFolderId}
        mediaType='video'
      />
    )
  }

  return (
    <VideosLayout
      collectionFolderId={collectionFolderId}
      initialSearch={videosSearch}
    />
  )
}

export default VideosPage
