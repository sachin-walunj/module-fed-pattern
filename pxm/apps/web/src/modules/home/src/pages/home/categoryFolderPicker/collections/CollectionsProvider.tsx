'use client'
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react'

import CollectionsSideDrawer from './CollectionsSideDrawer'
import { BrowseTreeItem } from '../../../../_common/types/collectionTypes'

interface CollectionsContextOptions {
  isSideDrawerOpen: boolean
  toggleSideDrawer: () => void
  collectionItems: BrowseTreeItem[]
  setCollectionItems: (values: BrowseTreeItem[]) => void
  fetchedItems: string[]
  setFetchedItems: Dispatch<SetStateAction<string[]>>
}
const CollectionsContext = createContext<CollectionsContextOptions>({
  isSideDrawerOpen: false,
  toggleSideDrawer: () => undefined,
  collectionItems: [],
  setCollectionItems: () => undefined,
  fetchedItems: [],
  setFetchedItems: () => undefined,
})

export const useCollectionsContext = () => {
  return useContext(CollectionsContext)
}

interface CollectionsProviderProps {
  initialCollectionItems: BrowseTreeItem[]
  children: React.ReactNode
}
export const CollectionsProvider: React.FC<CollectionsProviderProps> = ({
  children,
  initialCollectionItems,
}) => {
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false)
  const [collectionItems, setCollectionItems] = useState<BrowseTreeItem[]>(
    initialCollectionItems
  )
  const [fetchedItems, setFetchedItems] = useState<string[]>([])

  const toggleSideDrawer = () => {
    setIsSideDrawerOpen(!isSideDrawerOpen)
  }

  return (
    <CollectionsContext.Provider
      value={{
        isSideDrawerOpen,
        toggleSideDrawer,
        collectionItems,
        setCollectionItems,
        fetchedItems,
        setFetchedItems,
      }}
    >
      {children}
      <CollectionsSideDrawer
        isOpen={isSideDrawerOpen}
        onClose={toggleSideDrawer}
      />
    </CollectionsContext.Provider>
  )
}
