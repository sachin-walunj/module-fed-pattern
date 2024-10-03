import {
  CollectionFolderDetailsLayout,
  getTopic,
} from '@amplifi-workspace/home'

export default async function FeatureFolderDetailsLayout({
  params: { collectionFolderId },
  children,
}: {
  params: { collectionFolderId: string }
  children: JSX.Element
}) {
  const topicData = await getTopic(collectionFolderId)

  return (
    <CollectionFolderDetailsLayout topicData={topicData}>
      {children}
    </CollectionFolderDetailsLayout>
  )
}
