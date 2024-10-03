import { FolderDetailsContent } from './FolderDetailsContent'
import { CategoryHierarchyResponse } from '../../../_common/types/categoryHierarchyTypes'
import { Collection } from '../../../_common/types/collectionTypes'
import { HomePageHeader } from '../homePageHeader/HomePageHeader'

export function FolderDetailsView({
  collections,
  totalItems,
  categoryHierarchy,
}: {
  collections: Collection[]
  totalItems: number
  categoryHierarchy: CategoryHierarchyResponse | null
}) {
  return (
    <>
      <HomePageHeader />
      <FolderDetailsContent
        collections={collections}
        totalItems={totalItems}
        categoryHierarchy={categoryHierarchy}
      />
    </>
  )
}
