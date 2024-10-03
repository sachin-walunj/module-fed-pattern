'use client'
import dynamic from 'next/dynamic'

const BreadcrumbProvider = dynamic(
  () =>
    import('@amplifi-workspace/web-shared').then(
      (mod) => mod.BreadcrumbProvider
    ),
  { ssr: false }
)

export function BreadcrumbProvidercontainer({
  children,
}: {
  children: React.ReactNode
}) {
  return <BreadcrumbProvider>{children}</BreadcrumbProvider>
}
