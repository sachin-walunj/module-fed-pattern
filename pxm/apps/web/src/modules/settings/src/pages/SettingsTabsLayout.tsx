'use client'
import { useContext, useEffect } from 'react'

import { usePathname } from 'next/navigation'

import { BreadcrumbType } from '@patterninc/react-ui'

import {
  BreadcrumbContext,
  c,
  t,
  useRouterTabs,
} from '@amplifi-workspace/web-shared'

export function SettingsTabsLayout({ children }: { children: JSX.Element }) {
  const { updateBreadcrumbs } = useContext(BreadcrumbContext)
  const currentPath = usePathname()
  const routerConfig = [
    {
      label: t('settings:brands'),
      link: '/brands',
    },
  ]

  const routerTabs = useRouterTabs({ routerConfig })

  const topLevel = routerConfig.some((route) =>
    currentPath.endsWith(route.link)
  )

  useEffect(() => {
    const SETTINGS_ROOT_LEVEL_BREADCRUMBS: BreadcrumbType[] = [
      {
        name: c('settings'),
        link: `${process.env.ROUTE_PREFIX_V3}/settings`,
        changeType: 'rootLevel',
      },
    ]
    topLevel && updateBreadcrumbs(SETTINGS_ROOT_LEVEL_BREADCRUMBS)
  }, [currentPath, topLevel, updateBreadcrumbs])

  return (
    <div>
      {topLevel ? routerTabs : null}
      {children}
    </div>
  )
}
