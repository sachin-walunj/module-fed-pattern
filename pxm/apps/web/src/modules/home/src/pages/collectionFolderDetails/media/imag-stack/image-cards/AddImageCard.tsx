import { Checkbox, trimText } from '@patterninc/react-ui'

import ImageWithMultipleFallbacks from '../../../../../_common/components/ImageLoader/ImageWithMultipleFallbacks'
import { AddImageCardProps } from '../../../../../_common/types/imageStackTypes'

import styles from './add-image-card.module.scss'

interface ExtendedAddImageCardProps extends AddImageCardProps {
  isSelected: boolean
  onSelect: (id: string, isSelected: boolean) => void
}

const AddImageCard: React.FC<ExtendedAddImageCardProps> = ({
  id,
  file_name,
  imageUrl,
  isSelected,
  onSelect,
}) => {
  return (
    <div className={styles.card} id={id}>
      <div className={styles.mediaContainer}>
        <ImageWithMultipleFallbacks
          sources={imageUrl}
          customClassName={styles.media}
          alt='Card Image'
          width={30}
          height={30}
        />
      </div>
      <div className={styles.content}>
        <div>
          <header className={styles.title}>{trimText(file_name, 30)}</header>
          <div className={styles.subTitle}>
            <span>Image</span>
          </div>
        </div>
        <div className={styles.actions}>
          <Checkbox
            hideLabel
            label='No Label'
            stateName={id}
            checked={isSelected}
            callout={(stateName, checked) => {
              if (stateName !== undefined) {
                onSelect(stateName, checked)
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default AddImageCard
