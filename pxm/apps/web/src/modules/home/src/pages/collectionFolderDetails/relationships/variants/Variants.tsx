import { IUserState } from '@amplifi-workspace/store'

import { VariantsHeader } from './VariantsHeader'
import { VariantsList } from './VariantsList'
import { getSourceFromSearchHit } from '../../../../utils/productSearch'
import { getProductSearch, getTopic } from '../../actions'

export async function Variants({
  id,
  search,
  user,
}: {
  id: string
  search: string
  user: IUserState
}) {
  const topic = await getTopic(id),
    topicId = topic.id,
    parentTopicId = topic.parent_topic_id

  const variantsResponse = await getProductSearch({
      topicId,
      search,
      user,
      ...(topic.collection_type === 'variant'
        ? {
            key: 'variant',
            parentTopicId,
          }
        : topic.collection_type === 'parent'
        ? {
            key: 'parent',
          }
        : {
            key: 'collection',
          }),
    }),
    variantsData = getSourceFromSearchHit(variantsResponse)

  return (
    <>
      <VariantsHeader />
      <VariantsList variantsData={variantsData} />
    </>
  )
}
