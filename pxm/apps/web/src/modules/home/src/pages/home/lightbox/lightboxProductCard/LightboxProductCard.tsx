'use client'
import { useContext } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  Button,
  Icon,
  Tag,
  toast,
  Tooltip,
  trimText,
  useMediaQuery,
} from '@patterninc/react-ui'

import { RootState, useAppSelector } from '@amplifi-workspace/store'
import { c, useTranslate } from '@amplifi-workspace/web-shared'

import ImageWithMultipleFallbacks from '../../../../_common/components/ImageLoader/ImageWithMultipleFallbacks'
import { deleteLightboxItem } from '../actions'
import { LightboxContext } from '../lightboxContext'
import { LightboxContextType } from '../types'

import styles from './lightbox-product-card.module.scss'

interface LightboxProductCardProps {
  id: string
  name: string
  imageUrl?: string
  type: string
  file_type: string
  display_file: string
  customClassName: string
}

const LightboxProductCard: React.FC<LightboxProductCardProps> = ({
  id,
  name,
  imageUrl = `/images/no-img.svg`,
  type,
  file_type,
  display_file,
  customClassName,
}) => {
  const isMobileView = useMediaQuery({ type: 'max', breakpoint: 'sm' })
  const titleLength = isMobileView ? 20 : 30
  // get the selected lightbox from context
  const { selectedLightbox } = useContext(
    LightboxContext
  ) as LightboxContextType

  const userRole = useAppSelector((state: RootState) => state.user?.role)
  const queryClient = useQueryClient()
  const { t } = useTranslate('portal')

  const imageSources = [
    `${process.env.CLIENT_CDN_ENDPOINT}/${display_file}_thumb.webp`,
    `${process.env.CLIENT_CDN_ENDPOINT}/${display_file}_thumb.png`,
    `${process.env.CLIENT_CDN_ENDPOINT}/${display_file}_thumb.jpg`,
    `/images/no-img.svg`,
  ]

  const isWriteRolesEmpty =
    (selectedLightbox?.shared &&
      (!selectedLightbox?.write_roles?.length ||
        !selectedLightbox?.write_roles.includes(userRole))) ??
    false

  const { mutate: deleteItemFromLightbox } = useMutation({
    mutationFn: deleteLightboxItem,
    onMutate: () => {
      toast({
        type: 'info',
        message: t('deletingLightboxItem'),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetchLightboxItems'] })
      toast({
        type: 'success',
        message: t('lightboxItemDeletedSuccessfully'),
      })
    },
    onError: () => {
      toast({
        type: 'error',
        message: t('lightboxItemDeletionFailed'),
      })
    },
  })

  const handleDeleteItemFromLightbox = () => {
    deleteItemFromLightbox({
      entity: 'items',
      entity_id: selectedLightbox?.id,
      ids: [
        {
          id: id,
          name: name,
          type: type,
          file_type: file_type,
          display_file: display_file,
        },
      ],
    })
  }

  return (
    <div className={styles.card} id={id}>
      <div className={`${styles.draggableContainer} ${customClassName}`}>
        <Icon icon='hamburger' customClass='svg-purple' />
      </div>
      <div className={styles.mediaContainer}>
        <ImageWithMultipleFallbacks
          sources={imageSources}
          alt='Card Image'
          width={40}
          height={40}
        />
      </div>
      <div className={styles.content}>
        <div>
          <header className={styles.title}>
            {name.length > titleLength ? (
              <Tooltip tooltipContent={name}>
                <span>{trimText(name, titleLength)}</span>
              </Tooltip>
            ) : (
              name
            )}
          </header>
          <div className='flex gap-8'>
            <Icon icon='folder' />
            {/* This 'CHILD' is temporarily hardcoded with necessary CSS until we get the purpose */}
            {isMobileView ? null : <Tag color='gray'>Child</Tag>}
          </div>
        </div>
        <div className={styles.actions}>
          <span className={styles.infoIcon}>
            <Icon icon='info' size='16px' />
          </span>
          <Button
            as='confirmation'
            styleType='tertiary'
            confirmation={{
              body: t('areYouSureYouWantToDeleteItemFromLightbox'),
              confirmCallout: () => handleDeleteItemFromLightbox(),
              header: c('confirmDelete'),
              type: 'red',
            }}
            className='mr-8'
            disabled={isWriteRolesEmpty}
          >
            <Icon icon='trash' customClass='svg-red' size='16px' />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LightboxProductCard
