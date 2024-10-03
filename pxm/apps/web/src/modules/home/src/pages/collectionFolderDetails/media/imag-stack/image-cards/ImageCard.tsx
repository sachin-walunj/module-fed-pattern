import Image from 'next/image'

import { Button, Icon, trimText } from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { ImageCardType } from '../../../../../_common/types/imageStackTypes'

import styles from './image-card.module.scss'

type ImageCardProps = ImageCardType & {
  customClassName: string
  onDelete: (id: string) => void
}

const ImageCard: React.FC<ImageCardProps> = ({
  id,
  file_name,
  imageUrl,
  customClassName,
  onDelete,
}) => {
  const { t } = useTranslate('portal')
  return (
    <div className={styles.card} id={id}>
      <div className={`${styles.draggableContainer} ${customClassName}`}>
        <Icon icon='hamburger' customClass='svg-purple' />
      </div>
      <div className={styles.mediaContainer}>
        <Image
          src={imageUrl}
          alt='Card Image'
          className={styles.media}
          width={30}
          height={30}
        />
      </div>
      <div className={styles.content}>
        <div>
          <header className={styles.title}>{trimText(file_name, 20)}</header>
          <div className={styles.subTitle}>
            <span>Image</span>
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            as='confirmation'
            styleType='tertiary'
            className={styles.deleteButton}
            confirmation={{
              body: t(
                'areYouSureYouWantToRemoveTheSelectedItemFromThisImageStack'
              ),
              cancelButtonText: c('cancel'),
              confirmButtonText: c('remove'),
              confirmCallout: () => onDelete(id),
              header: t('confirmRemoveSelectedItem'),
              type: 'red',
            }}
          >
            <Icon icon='trash' customClass='svg-red' size='16px' />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ImageCard
