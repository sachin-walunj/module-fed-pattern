import { NextPage } from 'next'

import { ImagesLayout, NewMediaviewer } from '@amplifi-workspace/home'

interface ImagesPageProps {
  params: { collectionFolderId: string }
  searchParams: {
    imagesSearch?: string
    activeFile?: string
  }
}

const ImagesPage: NextPage<ImagesPageProps> = async ({
  params: { collectionFolderId },
  searchParams,
}) => {
  const { imagesSearch, activeFile } = searchParams

  if (activeFile) {
    return (
      <NewMediaviewer
        initialMediaId={activeFile}
        collectionFolderId={collectionFolderId}
        mediaType='image'
      />
    )
  }

  return (
    <ImagesLayout
      collectionFolderId={collectionFolderId}
      initialSearch={imagesSearch || ''}
    />
  )
}

export default ImagesPage
