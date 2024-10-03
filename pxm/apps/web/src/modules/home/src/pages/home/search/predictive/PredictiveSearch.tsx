import { SectionHeader, SelectDisplay } from '@patterninc/react-ui'

import { Collection, Media } from '../../../../_common/types/collectionTypes'
import { useCollectionRouter } from '../../_common/hooks/CollectionRouter'

import styles from './predictive-search.module.scss'

export interface PredictiveSearchBucket {
  category: Collection[]
  topic: Collection[]
  media: Media[]
}
interface PredictiveSearchProps {
  value: PredictiveSearchBucket
}
export const PredictiveSearch: React.FC<PredictiveSearchProps> = ({
  value,
}) => {
  return (
    <div className='flex flex-direction-column gap-8'>
      <PredictiveSearchSection label='Categories' items={value.category} />
      <PredictiveSearchSection label='Collections' items={value.topic} />
      <PredictiveSearchSection label='Files' items={value.media} />
    </div>
  )
}

interface PredictiveSearchSectionProps {
  label: string
  items: Collection[] | Media[]
}
const PredictiveSearchSection: React.FC<PredictiveSearchSectionProps> = ({
  label,
  items,
}) => {
  const { routeToCollection } = useCollectionRouter()
  if (items.length === 0) return null

  const actions = items.map((item) => ({
    name: item.id,
    label: item.type !== 'image' ? item.name : item.file_name,
    callout: () => routeToCollection(item),
    //Show the thumbnail for media, an a no-image icon for topics, and nothing for categories
    image:
      item.type === 'category'
        ? undefined
        : item.type === 'image'
        ? `${process.env.CLIENT_CDN_ENDPOINT}/${item.id}_thumb.png`
        : 'no-image',
  }))
  return (
    <div
      className={`flex flex-direction-column ${styles.predictiveSearchSection}`}
    >
      <SectionHeader title={label} />
      <SelectDisplay
        callout={(option) =>
          actions.find((action) => action.name === option.name)?.callout()
        }
        active='name'
        options={actions.map((action) => ({
          name: action.name,
          label: action.label,
          image: action.image,
          secondaryContent: <div />, //This makes it expand
        }))}
      />
    </div>
  )
}
