'use client'

import React, { createContext, useCallback, useEffect, useState } from 'react'

import { BreadcrumbType } from '@patterninc/react-ui'

type ContextStateType = {
  breadcrumbs: BreadcrumbType[]
  updateBreadcrumbs: React.Dispatch<React.SetStateAction<BreadcrumbType[]>>
  breadcrumbCallout: (breadcrumb: BreadcrumbType) => void
}

export const BreadcrumbContext = createContext<ContextStateType>({
  breadcrumbs: [],
  updateBreadcrumbs: () => null,
  breadcrumbCallout: () => null,
})

const { Provider } = BreadcrumbContext

export const BreadcrumbProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [breadcrumbs, updateBreadcrumbs] = useState<BreadcrumbType[]>(() => {
    if (typeof window !== 'undefined') {
      const savedBreadcrumbs = localStorage.getItem('breadcrumbs')
      return savedBreadcrumbs ? JSON.parse(savedBreadcrumbs) : []
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem('breadcrumbs', JSON.stringify(breadcrumbs))
  }, [breadcrumbs])

  const breadcrumbCallout = useCallback((breadcrumb: BreadcrumbType) => {
    updateBreadcrumbs((prevState) => {
      const index = prevState.findIndex((b) => b.name === breadcrumb.name)
      return index !== -1 ? prevState.slice(0, index + 1) : prevState
    })
  }, [])

  return (
    <Provider
      value={{
        breadcrumbs,
        updateBreadcrumbs,
        breadcrumbCallout,
      }}
    >
      {children}
    </Provider>
  )
}
