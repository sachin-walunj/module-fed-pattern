'use client'

import dynamic from 'next/dynamic'

const ToggleProviderWrapper = dynamic(
  () =>
    import('@amplifi-workspace/web-shared').then(
      (mod) => mod.ToggleProviderWrapper
    ),
  { ssr: false }
)

export const FeatureToggleContainer = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return <ToggleProviderWrapper>{children}</ToggleProviderWrapper>
}
