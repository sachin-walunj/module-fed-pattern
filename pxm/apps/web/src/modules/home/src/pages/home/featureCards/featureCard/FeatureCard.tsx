'use client'
import { Button, useIsMobileView, useMediaQuery } from '@patterninc/react-ui'

import { featuredFolderCardTypes } from '@amplifi-workspace/store'
import { c } from '@amplifi-workspace/web-shared'

import ImageWithMultipleFallbacks from '../../../../_common/components/ImageLoader/ImageWithMultipleFallbacks'
import { useCollectionRouter } from '../../_common/hooks/CollectionRouter'

import styles from './feature-card.module.scss'

export interface FeatureCardProps {
  id: string
  _source: featuredFolderCardTypes
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  id,
  _source: { name, display_file },
}) => {
  const { routeToCollection } = useCollectionRouter()
  const isMobileView = useMediaQuery({ type: 'max', breakpoint: 'sm' })

  const handleOpenFolder = () => {
    routeToCollection({ id: id.toString(), type: 'category' })
  }

  const imageSources = [
    `${process.env.CLIENT_CDN_ENDPOINT}/${display_file}_thumb.webp`,
    `${process.env.CLIENT_CDN_ENDPOINT}/${display_file}_thumb.png`,
    `${process.env.CLIENT_CDN_ENDPOINT}/${display_file}_thumb.jpg`,
    `/images/no-img.svg`,
  ]

  return (
    <div className={styles.cardWrapper}>
      <div className={styles.cardHeader}>
        <p className={styles.title}>{name}</p>
      </div>

      <div
        className={styles.cardContent}
        onClick={useIsMobileView() ? handleOpenFolder : undefined}
      >
        <ImageWithMultipleFallbacks
          sources={imageSources}
          alt='Card Image'
          width={isMobileView ? 150 : 250}
          height={isMobileView ? 100 : 150}
        />
      </div>
      {useIsMobileView() ? null : (
        <div className={styles.cardFooter}>
          <Button
            as='button'
            styleType='tertiary'
            className='card-button'
            onClick={handleOpenFolder}
          >
            {c('openFolder')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default FeatureCard
