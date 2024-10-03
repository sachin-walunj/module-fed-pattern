import { ImageStack } from '@amplifi-workspace/home'

const ImageStackPage = ({
  params: { collectionFolderId },
}: {
  params: { collectionFolderId: string }
}) => {
  return <ImageStack collectionFolderId={collectionFolderId} />
}

export default ImageStackPage
