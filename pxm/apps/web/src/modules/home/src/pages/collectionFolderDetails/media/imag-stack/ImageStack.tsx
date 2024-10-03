import ImageStackLayout from './image-stack-layout/ImageStackLayout'
import { getSession } from '../../../../_common/server/actions'
import {
  getImageStack,
  GetImageStackPayload,
} from '../../../../server/imageStackActions'

interface ImageStackProps {
  collectionFolderId: string
}

export async function ImageStack({ collectionFolderId }: ImageStackProps) {
  const user = await getSession()
  const payload: GetImageStackPayload = {
    topic_id: collectionFolderId,
    page: 1,
  }

  const getAllImageStackData = async () => {
    const data = await getImageStack(payload)
    return data.map((stack) => ({
      id: stack.id,
      fileProps: {
        data: [stack.created_date],
        name: stack.stack_group_name,
        url: stack.files[0]
          ? `${process.env.CLIENT_CDN_ENDPOINT}/${stack.files[0].id}_thumb.png`
          : `/images/no-img.svg`,
      },
      files: stack.files.map((file) => ({
        ...file,
        imageUrl: `${process.env.CLIENT_CDN_ENDPOINT}/${file.id}_thumb.png`,
      })),
    }))
  }

  const imageStacks = await getAllImageStackData()

  return (
    <ImageStackLayout
      footerRightPrimaryButtonText={'Create Image Stack'}
      collectionFolderId={collectionFolderId}
      initialImageStacks={imageStacks}
      user={user}
    />
  )
}
