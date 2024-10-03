'use client'

import React from 'react'

import { useAppSelector } from '@amplifi-workspace/store'
import { useQueryState } from '@amplifi-workspace/web-shared'

import { Links } from './Links'
import { LinksHeader } from './LinksHeader'

interface ImagesLayoutProps {
  collectionFolderId: string
  initialSearch: string
}

export const LinksLayout: React.FC<ImagesLayoutProps> = ({
  collectionFolderId,
  initialSearch,
}) => {
  const user = useAppSelector((state) => state.user)
  const [search, setSearch] = useQueryState<string>({
    key: 'linksSearch',
    defaultValue: initialSearch,
  })

  return (
    <>
      <LinksHeader
        search={search}
        setSearch={(value) => setSearch(value ?? '')}
      />
      <Links
        collectionFolderId={collectionFolderId}
        search={search}
        user={user}
      />
    </>
  )
}
