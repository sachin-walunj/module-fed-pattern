'use client'

import React from 'react'

import { useAppSelector } from '@amplifi-workspace/store'
import { useQueryState } from '@amplifi-workspace/web-shared'

import { Videos } from './Videos'
import { VideosHeader } from './VideosHeader'

interface VideosLayoutProps {
  collectionFolderId: string
  initialSearch: string
}

export const VideosLayout: React.FC<VideosLayoutProps> = ({
  collectionFolderId,
  initialSearch,
}) => {
  const user = useAppSelector((state) => state.user)
  const [search, setSearch] = useQueryState<string>({
    key: 'videosSearch',
    defaultValue: initialSearch,
  })

  return (
    <>
      <VideosHeader
        search={search}
        setSearch={(value) => setSearch(value ?? '')}
      />
      <Videos
        collectionFolderId={collectionFolderId}
        search={search}
        user={user}
      />
    </>
  )
}
