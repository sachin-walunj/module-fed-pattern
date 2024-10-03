'use client'
import dynamic from 'next/dynamic'

const QueryStateProviderBase = dynamic(
  () =>
    import('@amplifi-workspace/web-shared').then(
      (mod) => mod.QueryStateProvider
    ),
  { ssr: false }
)

export function QueryStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <QueryStateProviderBase>{children}</QueryStateProviderBase>
}
