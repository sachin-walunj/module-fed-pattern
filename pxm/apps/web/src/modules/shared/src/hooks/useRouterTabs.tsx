'use client'

import { useMemo } from 'react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { RouterTabs, RouterTabsProps } from '@patterninc/react-ui'

type useRouterTabsProps = {
  routerConfig: NonNullable<RouterTabsProps['mobileConfig']>
  subtabs?: boolean
}

export function useRouterTabs({
  routerConfig,
  subtabs = false,
}: useRouterTabsProps) {
  const currentPath = usePathname(),
    router = useRouter()

  const basePath = useMemo(() => {
    const matchingPath = routerConfig?.find((config) =>
      currentPath.includes(config.link)
    )
    const indexOfMatchingPathInCurrentPath = currentPath.indexOf(
      matchingPath?.link || ''
    )
    return currentPath.slice(0, indexOfMatchingPathInCurrentPath)
  }, [currentPath, routerConfig])

  const updatedConfig = routerConfig?.map((config) => {
    return {
      ...config,
      link: `${basePath}${config.link}`,
      ...(config?.subrows
        ? {
            subrows: config.subrows?.map((subrow) => ({
              ...subrow,
              link: `${basePath}${config.link}${subrow.link}`,
            })),
          }
        : {}),
    }
  })

  const isActivePath = (path: string) => currentPath.includes(path)

  return (
    <RouterTabs
      {...(subtabs
        ? { subtabs: true }
        : {
            mobileConfig: updatedConfig,
            navigate: (link) => router.push(link),
          })}
      currentPath={currentPath}
    >
      {updatedConfig?.map((tab) => (
        <Link
          className={isActivePath(tab.link) ? 'active' : ''}
          key={tab.label}
          href={tab.link}
        >
          {tab.label}
        </Link>
      ))}
    </RouterTabs>
  )
}
