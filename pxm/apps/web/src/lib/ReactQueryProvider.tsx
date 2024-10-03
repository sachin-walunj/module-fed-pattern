'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const ReactQueryProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [queryClient] = useState(
      () =>
        new QueryClient({
          defaultOptions: {
            queries: {
              refetchOnWindowFocus: false,
            },
          },
        })
    ),
    enableReactQueryDevTools =
      localStorage.getItem('react-query-devtools') === 'true'

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {enableReactQueryDevTools ? <ReactQueryDevtools /> : null}
    </QueryClientProvider>
  )
}

export default ReactQueryProvider
