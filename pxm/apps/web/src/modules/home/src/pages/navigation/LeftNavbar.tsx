'use client'

import { useContext } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  APP_LOGOS,
  IconStringList,
  LeftNav,
  LeftNavLinkObj,
  useToggle,
} from '@patterninc/react-ui'

import { useAppSelector } from '@amplifi-workspace/store'
import {
  BreadcrumbContext,
  c,
  useTranslate,
} from '@amplifi-workspace/web-shared'

import LeftNavbarFooter from './LeftNavbarFooter'
import LeftNavbarMobileHeader from './LeftNavbarMobileHeader'

export const LeftNavbar = () => {
  const { t } = useTranslate('portal')
  const brandsEnabled = useToggle('add_brands_to_pxm')
  const matchifyRedesignToggle = useToggle('matchify_revamp_landing_page')
  const router = useRouter()
  const { breadcrumbs } = useContext(BreadcrumbContext)

  const userPermissions = ['admin', 'superadmin']

  const user = useAppSelector((state) => state.user)
  const userName = `${user?.first_name} ${user?.last_name}`

  const leftNavLinks: LeftNavLinkObj[] = [
    {
      name: c('home'),
      link: `${process.env.ROUTE_PREFIX_V3}/portal`,
      icon: 'speedometer',
      permissions: ['admin', 'superadmin'],
    },
    {
      name: c('optimize'),
      link: '/optimize-content',
      icon: 'ai',
      permissions: ['admin', 'superadmin'],
    },
    {
      name: c('syndicate'),
      link: '/syndication',
      icon: 'rocket',
      permissions: ['admin', 'superadmin'],
    },
    {
      name: c('match'),
      link: matchifyRedesignToggle
        ? `${process.env.ROUTE_PREFIX_V3}/match`
        : '/match',
      icon: 'puzzle',
      permissions: ['admin', 'superadmin'],
    },
    ...(brandsEnabled
      ? [
          {
            name: c('settings'),
            link: `${process.env.ROUTE_PREFIX_V3}/settings`,
            icon: 'config' as IconStringList,
            permissions: ['admin', 'superadmin'],
            footerLink: true,
          },
        ]
      : []),
  ]

  return (
    <div>
      <LeftNav
        logo={{
          url: APP_LOGOS.PXM.logo,
          abbreviatedUrl: APP_LOGOS.PXM.abbr,
          isolatedUrl: APP_LOGOS.PXM.isolated,
        }}
        leftNavLinks={leftNavLinks}
        routerComponent={Link as never}
        routerProp='href'
        mobileProps={{
          mobileHeaderChildren: <LeftNavbarMobileHeader />,
        }}
        breadcrumbs={breadcrumbs}
        accountPopoverProps={{
          name: userName ?? t('user'),
          options: [
            {
              icon: 'logout',
              label: c('logout'),
              callout: () => {
                router.push('/api/auth/logout')
              },
            },
          ],
        }}
        userPermissions={userPermissions}
        navigate={() => router.push(`${process.env.ROUTE_PREFIX_V3}/portal`)}
        footer={({ sidebarExpanded }) => (
          <LeftNavbarFooter isExpanded={sidebarExpanded} />
        )}
      />
    </div>
  )
}
