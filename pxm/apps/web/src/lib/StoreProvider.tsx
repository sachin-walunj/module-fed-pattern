'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'

import { useRouter } from 'next/navigation'

import {
  AppStore,
  IConfigState,
  makeStore,
  setConfig,
  setMyLightboxList,
  setUser,
  setVariants,
  variantsType,
} from '@amplifi-workspace/store'

export type UserTypes = {
  first_name: string
  last_name: string
  email: string
  active: boolean
  authenticated: boolean
  ci_session: string
  language: string
  role: string
  user_id: string
  uid: string
  regions: {
    active: boolean
    id: string
    is_primary: boolean
    name: string
    rethinkdb_id: string
  }[]
  lightboxes: {
    created_by: string
    created_date: string
    id: string
    item_count: number
    name: string
    read_roles: string[]
    write_roles: string[]
  }[]
  v3_enabled?: boolean
}

export function StoreProvider({
  sessionData,
  children,
  configData,
  variantsToDownload,
}: {
  sessionData: UserTypes
  configData: IConfigState
  children: React.ReactNode
  variantsToDownload: variantsType
}) {
  const router = useRouter()
  const storeRef = useRef<AppStore>()
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
    storeRef.current.dispatch(setUser(sessionData))
    storeRef.current.dispatch(setMyLightboxList(sessionData?.lightboxes))
    storeRef.current.dispatch(setConfig(configData))
    storeRef.current.dispatch(setVariants(variantsToDownload))
  }

  // Redirecting back to v2 in case of V3 toggle disabled
  if (!sessionData?.v3_enabled && process.env.NODE_ENV !== 'development') {
    router.push('/portal')
    router.refresh()
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
