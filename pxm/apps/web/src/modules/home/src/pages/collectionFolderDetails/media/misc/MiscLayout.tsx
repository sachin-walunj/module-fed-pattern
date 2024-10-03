'use client'

import React from 'react'

import { useAppSelector } from '@amplifi-workspace/store'
import { useQueryState } from '@amplifi-workspace/web-shared'

import { Misc } from './Misc'
import { MiscHeader } from './MiscHeader'

interface MiscLayoutProps {
  collectionFolderId: string
  initialSearch: string
}

export const MiscLayout: React.FC<MiscLayoutProps> = ({
  collectionFolderId,
  initialSearch,
}) => {
  const user = useAppSelector((state) => state.user)
  const [search, setSearch] = useQueryState<string>({
    key: 'miscSearch',
    defaultValue: initialSearch,
  })

  return (
    <>
      <MiscHeader
        search={search}
        setSearch={(value: string) => setSearch(value ?? '')}
      />
      <Misc
        collectionFolderId={collectionFolderId}
        search={search}
        user={user}
      />
    </>
  )
}
