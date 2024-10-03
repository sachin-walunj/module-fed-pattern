'use client'

import { useAppSelector } from '@amplifi-workspace/store'
import { useQueryState } from '@amplifi-workspace/web-shared'

import { Images } from './Images'
import { ImagesHeader } from './ImagesHeader'

interface ImagesLayoutProps {
  collectionFolderId: string
  initialSearch: string
}

export const ImagesLayout: React.FC<ImagesLayoutProps> = ({
  collectionFolderId,
  initialSearch,
}) => {
  const user = useAppSelector((state) => state.user)
  const [search, setSearch] = useQueryState<string>({
    key: 'imagesSearch',
    defaultValue: initialSearch,
  })

  return (
    <>
      <ImagesHeader
        search={search}
        setSearch={(value) => setSearch(value ?? '')}
      />
      <Images
        collectionFolderId={collectionFolderId}
        search={search}
        user={user}
      />
    </>
  )
}
