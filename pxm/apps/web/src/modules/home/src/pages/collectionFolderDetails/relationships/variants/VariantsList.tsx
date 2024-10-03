'use client'

import moment from 'moment'

import {
  Checkbox,
  EmptyState,
  PageFooter,
  toast,
  useIsMobileView,
} from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { CollectionCard } from '../../../../_common/components/CollectionCard/CollectionCard'
import { useCollectionCardCheckboxes } from '../../../../_common/hooks/UseCollectionCardCheckboxes'
import { Collection } from '../../../../_common/types/collectionTypes'

export function VariantsList({ variantsData }: { variantsData: Collection[] }) {
  const { t } = useTranslate('portal')
  const isMobileView = useIsMobileView()

  const { checkAll, checkAllCallout, collectionCards, onCheckCallout } =
    useCollectionCardCheckboxes({ data: variantsData })

  return (
    <>
      <Checkbox
        customClass='m-16'
        checked={checkAll}
        label={c('selectAll')}
        callout={(_, check: boolean) => checkAllCallout(check)}
        disabled={collectionCards?.length === 0}
      />

      <div
        className={`flex flex-wrap ${
          isMobileView ? 'justify-content-center' : ''
        } gap-16`}
      >
        {collectionCards.map((variant) => (
          <CollectionCard
            key={variant.id}
            card={variant}
            onCheckCallout={onCheckCallout}
            tags={[{ children: 'Variant', color: 'blue' }]}
            collectionDetails={[
              moment(variant.created_date).format('MMM D, YYYY'),
            ]}
          />
        ))}
      </div>

      {collectionCards.length === 0 ? (
        <EmptyState primaryText={t('noVariantsFound')} />
      ) : null}

      <PageFooter
        rightSection={[
          {
            type: 'buttonGroup',
            styleType: 'primary-blue',
            buttons: [
              {
                actions: [
                  {
                    text: t('addVariant'),
                    callout: () =>
                      toast({
                        message: 'Add a variant clicked',
                        type: 'success',
                      }),
                  },
                ],
              },
              {
                children: t('publishToChannel'),
                onClick: () =>
                  toast({
                    message: 'Publish to channel clicked',
                    type: 'success',
                  }),
              },
            ],
          },
        ]}
      />
    </>
  )
}
