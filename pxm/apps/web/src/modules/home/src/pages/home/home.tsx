'use client'
import { useContext, useEffect } from 'react'

import { usePathname } from 'next/navigation'

import { BreadcrumbType } from '@patterninc/react-ui'

import { BreadcrumbContext } from '@amplifi-workspace/web-shared'

import FeatureCardContainer from './featureCards/featureCardContainer/FeatureCardContainer'
import { HomePageHeader } from './homePageHeader/HomePageHeader'

import styles from './home.module.scss'

export const ROOT_LEVEL_BREADCRUMBS: BreadcrumbType[] = [
  {
    name: 'Home',
    link: '/v3/portal',
    changeType: 'rootLevel',
  },
]
export function Home() {
  const { updateBreadcrumbs } = useContext(BreadcrumbContext)
  const pathname = usePathname()
  useEffect(() => {
    // Set root-level breadcrumbs
    updateBreadcrumbs(ROOT_LEVEL_BREADCRUMBS)
  }, [pathname, updateBreadcrumbs])
  return (
    <div className={styles['container']}>
      <div className={styles.homePageHeader}>
        <HomePageHeader />
      </div>
      <FeatureCardContainer />
    </div>
  )
}

export default Home
