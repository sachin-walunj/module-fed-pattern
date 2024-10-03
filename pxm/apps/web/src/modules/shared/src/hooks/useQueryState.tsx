'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

interface SetStateOptions {
  baseUrl?: string
}
/** Stores state as search parameter json values in the url */
export function useQueryState<T = undefined>(props: {
  key: string
}): [T | undefined, (value: T | undefined, options?: SetStateOptions) => void]
export function useQueryState<T>(props: {
  key: string
  defaultValue: T
}): [T, (value: T, options?: SetStateOptions) => void]
export function useQueryState<T>({
  key,
  defaultValue,
}: {
  key: string
  defaultValue?: T
}): [T | undefined, (value: T | undefined, options?: SetStateOptions) => void] {
  const searchParams = useSearchParams()
  const { setSearchParam, deleteSearchParam, setBaseUrl } =
    useContext(QueryStateContext)

  const setUrlValue = (
    value: T | undefined,
    options?: SetStateOptions
  ): void => {
    const encodedValue = JSON.stringify(value)
    //If stuff is empty, remove it from the url
    if (
      value === undefined ||
      value === '' ||
      value === null ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    ) {
      deleteSearchParam(key)
    } else {
      setSearchParam(key, encodedValue)
    }

    options?.baseUrl && setBaseUrl(options?.baseUrl)
  }

  useEffect(() => {
    if (defaultValue && !searchParams.get(key)) {
      setUrlValue(defaultValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on mount, needed to set default value
  }, [])

  const value = useMemo(() => {
    const val = searchParams.get(key)
    return val ? (JSON.parse(val) as T) : defaultValue
  }, [key, searchParams, defaultValue])

  return [value, setUrlValue]
}

interface QueryStateContextType {
  url: string
  setSearchParam: (key: string, value: string) => void
  deleteSearchParam: (key: string) => void
  setBaseUrl: (url: string) => void
}
const QueryStateContext = createContext<QueryStateContextType>({
  url: '',
  setSearchParam: () => undefined,
  deleteSearchParam: () => undefined,
  setBaseUrl: () => undefined,
})

export const QueryStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const urlRef = useRef(window.location.href)
  const [forceRerender, setForceRerender] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()

  const setUrlParams = (newUrl: string) => {
    const url = new URL(newUrl)
    //Removes dependency on the path so that only the search params are updated
    url.pathname = window.location.pathname
    urlRef.current = url.href
  }

  const setSearchParam = useCallback(
    (key: string, value: string) => {
      const url = new URL(urlRef.current)
      url.searchParams.set(key, value)
      setUrlParams(url.href)
      setForceRerender(forceRerender + 1)
    },
    [urlRef, forceRerender, setForceRerender]
  )

  const deleteSearchParam = useCallback(
    (key: string) => {
      const url = new URL(urlRef.current)
      url.searchParams.delete(key)
      setUrlParams(url.href)
      setForceRerender(forceRerender + 1)
    },
    [forceRerender]
  )

  const setBaseUrl = useCallback(
    (baseUrl: string) => {
      //If this is a full path, just replace the search params from the current url
      if (baseUrl.startsWith('http')) {
        const url = new URL(baseUrl)
        url.search = new URL(urlRef.current).search
        urlRef.current = url.href
      } else {
        //If this is just the relative path, replace the current url with this path
        const url = new URL(urlRef.current)
        url.pathname = baseUrl
        urlRef.current = url.href
      }
      setForceRerender(forceRerender + 1)
    },
    [urlRef, setForceRerender, forceRerender]
  )

  //Whenever the urlRef changes, update the url
  useEffect(() => {
    if (window.location.href !== urlRef.current) {
      router.push(urlRef.current)
    }
  }, [urlRef, forceRerender, router])

  //Keep the urlRef up to date with the current url
  useEffect(() => {
    if (window.location.href !== urlRef.current) {
      urlRef.current = window.location.href
    }
  }, [searchParams])

  return (
    <QueryStateContext.Provider
      value={{
        url: urlRef.current,
        setSearchParam,
        deleteSearchParam,
        setBaseUrl,
      }}
    >
      {children}
    </QueryStateContext.Provider>
  )
}
