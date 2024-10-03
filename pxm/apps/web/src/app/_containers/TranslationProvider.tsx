'use client'
import dynamic from 'next/dynamic'

const PXMTranslationProvider = dynamic(
  () =>
    import('@amplifi-workspace/web-shared').then(
      (mod) => mod.PXMTranslationProvider
    ),
  { ssr: false }
)

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <PXMTranslationProvider>{children}</PXMTranslationProvider>
}
