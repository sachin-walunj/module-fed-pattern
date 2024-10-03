'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  FormFooter,
  PageFooter,
  SideDrawer,
  TextInput,
} from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { createBrand } from './actions'
import { errorToast } from '../../_common/functions/errorToast'

export function BrandsFooter() {
  const { t } = useTranslate('settings')
  const [isOpen, setIsOpen] = useState(false)
  const [brandName, setBrandName] = useState('')
  const router = useRouter()

  const onSave = async () => {
    try {
      const brand = await createBrand({ name: brandName })
      setIsOpen(false)
      router.push(`${process.env.ROUTE_PREFIX_V3}/settings/brands/${brand.id}`)
    } catch (error) {
      let message: string
      if (error instanceof Error && error.message.includes('Bad Request')) {
        message = t('brandNameAlreadyExists')
      } else {
        message = t('errorCreatingBrand')
      }

      errorToast(message)
    }
  }

  return (
    <>
      <PageFooter
        rightSection={[
          {
            children: t('createBrand'),
            onClick: () => setIsOpen(true),
            styleType: 'primary-blue',
            type: 'button',
          },
        ]}
      />
      <SideDrawer
        isOpen={isOpen}
        closeCallout={() => setIsOpen(false)}
        headerContent={t('createBrand')}
        footerContent={
          <FormFooter
            cancelButtonProps={{
              onClick: () => setIsOpen(false),
            }}
            saveButtonProps={{
              onClick: onSave,
              styleType: 'primary-blue',
              children: c('create'),
              disabled: !brandName.length,
            }}
          />
        }
      >
        <TextInput
          value={brandName}
          callout={(_, value) => setBrandName(value.toString())}
          required
          autoFocus
          labelText={t('brandName')}
          placeholder={t('enterABrandName')}
        />
      </SideDrawer>
    </>
  )
}
