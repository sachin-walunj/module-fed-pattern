'use client'

import { c, useRouterTabs } from '@amplifi-workspace/web-shared'

export function Relationships({
  children,
}: {
  children: JSX.Element
}): JSX.Element {
  const routerConfig = [
    { label: c('variants'), link: '/variants' },
    { label: c('related'), link: '/related' },
    {
      label: c('listings'),
      link: '/listings',
    },
  ]
  const routerTabs = useRouterTabs({
    routerConfig,
    subtabs: true,
  })

  return (
    <>
      {routerTabs}
      {children}
    </>
  )
}
