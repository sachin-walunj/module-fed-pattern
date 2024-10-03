import { NextPage } from 'next'

import { redirect } from 'next/navigation'

const MediaPage: NextPage<{
  params: { collectionFolderId: string }
}> = ({ params: { collectionFolderId } }) => {
  return redirect(
    `${process.env.ROUTE_PREFIX_V3}/portal/${collectionFolderId}/media/images`
  )
}
export default MediaPage