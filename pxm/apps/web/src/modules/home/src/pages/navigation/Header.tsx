'use client'
import { useContext } from 'react'

import { useRouter } from 'next/navigation'

import { Breadcrumbs, useIsMobileView } from '@patterninc/react-ui'

import { BreadcrumbContext } from '@amplifi-workspace/web-shared'

import { CollectionsButton } from '../home/categoryFolderPicker/collections/CollectionsButton'
import { LightboxContainer, LightboxProvider } from '../home/lightbox'

import Styles from './header.module.scss'

type Breadcrumbs = {
  link: string
  name: string
}

export const Header = () => {
  const { breadcrumbCallout, breadcrumbs } = useContext(BreadcrumbContext)
  const router = useRouter()

  return useIsMobileView() ? (
    <div className={Styles.mobileHeader}>
      <Breadcrumbs
        breadcrumbs={breadcrumbs}
        callout={(breadcrumb) => {
          router.push(breadcrumb.link)
          breadcrumbCallout(breadcrumb)
        }}
      />
    </div>
  ) : (
    <div className={Styles.headerContainer}>
      <div className={Styles.header}>
        <div className={Styles.headerLeftSection}>
          <Breadcrumbs
            breadcrumbs={breadcrumbs}
            callout={(breadcrumb) => {
              router.push(breadcrumb.link)
              breadcrumbCallout(breadcrumb)
            }}
          />
        </div>
        <div className={Styles.headerRightSection}>
          <CollectionsButton />
          <LightboxProvider>
            <LightboxContainer />
          </LightboxProvider>
        </div>
      </div>
    </div>
  )
}
