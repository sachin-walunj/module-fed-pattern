'use client'

import { c, useQueryState, useRouterTabs } from '@amplifi-workspace/web-shared'

export function Media({ children }: { children: JSX.Element }): JSX.Element {
  const [activeFile] = useQueryState<string | undefined>({
    key: 'activeFile',
  })

  const routerConfig = [
    { label: c('images'), link: '/images' },
    { label: c('imageStack'), link: '/image-stack' },
    { label: c('videos'), link: '/videos' },
    { label: c('docs'), link: '/docs' },
    { label: c('links'), link: '/links' },
    { label: c('misc'), link: '/misc' },
  ]
  const routerTabs = useRouterTabs({
    routerConfig,
    subtabs: true,
  })

  return (
    <>
      {!activeFile && routerTabs}
      {children}
    </>
  )
}
