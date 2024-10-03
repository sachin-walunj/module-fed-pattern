'use client'

import { useContext, useEffect } from 'react'

import Image from 'next/image'

import { InformationPane } from '@patterninc/react-ui'

import {
  BreadcrumbContext,
  c,
  useTranslate,
} from '@amplifi-workspace/web-shared'

import { errorToast } from '../../../_common/functions/errorToast'
import { Brand } from '../types'

export function BrandSideBar({
  brand,
  hasError,
}: {
  brand: Brand | null
  hasError: boolean
}) {
  const { t } = useTranslate('settings')
  const { updateBreadcrumbs } = useContext(BreadcrumbContext)

  useEffect(() => {
    if (hasError) {
      errorToast(t('errorLoadingBrand'))
    }
  }, [hasError, t])

  useEffect(() => {
    updateBreadcrumbs([
      {
        name: c('settings'),
        link: `${process.env.ROUTE_PREFIX_V3}/settings`,
        changeType: 'rootLevel',
      },
      {
        name: brand?.name || t('brand'),
        link: `${process.env.ROUTE_PREFIX_V3}/settings/brands/${brand?.id}`,
      },
    ])
  }, [brand, t, updateBreadcrumbs])

  return (
    <InformationPane
      header={{
        labelAndData: {
          label: t('brandDetails'),
          data: '',
          check: true,
        },
        edit: () => null, // TODO: set up side drawer
      }}
    >
      <InformationPane.CustomSection>
        <div style={{ position: 'relative' }}>
          {/* TODO: figure out backup image */}
          <Image src={brand?.logo || ''} alt={t('brandLogo')} fill />
        </div>
      </InformationPane.CustomSection>
    </InformationPane>
  )
}
