'use client'

import { usePathname, useRouter } from 'next/navigation'

import { Card, TagProps, toast } from '@patterninc/react-ui'

import {
  AppDispatch,
  SelectedProduct,
  setSelectedProducts,
  toggleLightboxDrawer,
  useAppDispatch,
} from '@amplifi-workspace/store'
import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { Collection } from '../../types/collectionTypes'

export type CollectionCardType = {
  checked: boolean
} & Collection

export type CollectionCardProps = {
  card: CollectionCardType
  onCheckCallout: (name: string, checked: boolean) => void
  linkSuffix?: string
  tags?: TagProps[]
  collectionDetails?: string[]
  onDownload?: (isOpen: boolean, data: Array<CollectionCardType>) => void
}

export function CollectionCard({
  card,
  onCheckCallout,
  linkSuffix = '',
  tags,
  onDownload,
  collectionDetails,
}: CollectionCardProps) {
  const { t } = useTranslate('portal')
  const router = useRouter(),
    currentPath = usePathname(),
    dispatch: AppDispatch = useAppDispatch()

  const cardCallout = () => {
    const updatedPath = `${currentPath}/${card.id}`
    router.push(updatedPath)
  }

  const toggleAddToLightboxDrawer = () => {
    const selectedProduct: SelectedProduct = {
      id: card.id,
      name: card.name,
      type: card.type || 'topic',
    }

    // Set the selected product OR single card in the Redux store
    dispatch(setSelectedProducts([selectedProduct]))

    // Open the lightbox drawer
    dispatch(toggleLightboxDrawer({ parent: 'AddToLightbox' }))
  }

  return (
    <Card
      onCheckCallout={(name, checked) => onCheckCallout(name, checked)}
      fileProps={{
        name: card.name,
        url: `${process.env.CLIENT_CDN_ENDPOINT}/${card?.display_file}_thumb.png`,
        data: collectionDetails,
        isChecked: card.checked,
      }}
      cardCallout={cardCallout}
      tags={tags}
      footerChildren={
        <Card.ButtonContainer>
          <Card.IconButton
            icon='download'
            onClick={() => onDownload && onDownload(true, [{ ...card }])}
            tooltipProps={{
              tooltipContent: c('download'),
            }}
          />
          <Card.VerticalDivider />
          <Card.IconButton
            icon='layers'
            onClick={toggleAddToLightboxDrawer}
            tooltipProps={{
              tooltipContent: t('addToLightbox'),
            }}
          />
          <Card.VerticalDivider />
          <Card.IconButton
            icon='share2'
            onClick={() =>
              toast({ message: c('shareClicked'), type: 'success' })
            }
            tooltipProps={{
              tooltipContent: c('share'),
            }}
          />
        </Card.ButtonContainer>
      }
    />
  )
}
