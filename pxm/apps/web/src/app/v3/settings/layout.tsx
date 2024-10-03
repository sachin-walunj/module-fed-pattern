import { redirect } from 'next/navigation'

import { SettingsTabsLayout } from '@amplifi-workspace/settings'
import { useServerToggle } from '@amplifi-workspace/static-shared'

export default async function SettingsLayout({
  children,
}: {
  children: JSX.Element
}) {
  const brandsEnabled = await useServerToggle('add_brands_to_pxm')
  if (!brandsEnabled) {
    return redirect(`${process.env.ROUTE_PREFIX_V3}/portal`)
  }
  return <SettingsTabsLayout>{children}</SettingsTabsLayout>
}
