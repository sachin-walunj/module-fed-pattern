'use client'

import { useRouter } from 'next/navigation'

import { useQueryState } from '@amplifi-workspace/web-shared'

import { ItemType } from '../../../../_common/types/collectionTypes'

export const useCollectionRouter = () => {
  const router = useRouter()
  const [folderId, setFolderId] = useQueryState<string>({ key: 'folderId' })

  const routeToCollection = (item: {
    type: ItemType
    id: string
    name?: string
  }): void => {
    if (item.type === 'topic' || item.type === 'image') {
      const url = `${process.env.ROUTE_PREFIX_V3}/portal/${item.id}`
      router.push(url)
    } else if (
      item.type === 'unassociated' &&
      item.name === 'Unassociated Listings'
    ) {
      router.push(`${process.env.ROUTE_PREFIX_V3}/portal/unassociated-listings`)
    } else {
      const url = `${process.env.ROUTE_PREFIX_V3}/portal`
      setFolderId(item.id, { baseUrl: url })
    }
  }

  return {
    routeToCollection,
    folderId,
  }
}
