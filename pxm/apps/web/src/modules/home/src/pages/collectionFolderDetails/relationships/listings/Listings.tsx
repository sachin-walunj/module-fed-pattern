import { IUserState } from '@amplifi-workspace/store'

import { ListingsList } from './ListingsList'
import { getTopic } from '../../actions'

export async function Listings({
  id,
}: {
  id: string
  search: string
  user: IUserState
}) {
  const topic = await getTopic(id),
    topicId = topic.id
  return <ListingsList topicId={topicId} />
}
