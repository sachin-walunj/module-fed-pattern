'use client'

import React from 'react'

import { useAppSelector } from '@amplifi-workspace/store'
import { useQueryState } from '@amplifi-workspace/web-shared'

import { Docs } from './Docs'
import { DocsHeader } from './DocsHeader'

interface ImagesLayoutProps {
  collectionFolderId: string
  initialSearch: string
}

export const DocsLayout: React.FC<ImagesLayoutProps> = ({
  collectionFolderId,
  initialSearch,
}) => {
  const user = useAppSelector((state) => state.user)
  const [search, setSearch] = useQueryState<string>({
    key: 'docsSearch',
    defaultValue: initialSearch,
  })

  return (
    <>
      <DocsHeader
        search={search}
        setSearch={(value) => setSearch(value ?? '')}
      />
      <Docs
        collectionFolderId={collectionFolderId}
        search={search}
        user={user}
      />
    </>
  )
}
