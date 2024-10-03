'use client'

import { useState } from 'react'

import {
  DevTools,
  getEnvironmentName,
  PatternToastContainer,
  ToggleProvider,
} from '@patterninc/react-ui'

const AMP_DISTRIBUTION_KEY = '0ef94eef-bf6d-4720-bf49-4e4c33d8401a'

export function getCurrentEnv() {
  const environmentName = getEnvironmentName()
  if (environmentName === 'demo' || environmentName === 'stage') {
    return 'staging'
  }
  return environmentName
}

export const ToggleProviderWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [, setRerender] = useState({})
  const [areTogglesLoaded, setAreTogglesLoaded] = useState(false)

  return (
    <ToggleProvider
      distributionKey={AMP_DISTRIBUTION_KEY}
      environment={getCurrentEnv()}
      finishedLoadingCallback={setAreTogglesLoaded}
    >
      {/* Create App loader with skeleton */}
      {!areTogglesLoaded ? <div>Loading...</div> : <div>{children}</div>}
      <DevTools
        backendNames={['connect-auth', 'connect-engine']}
        rerenderCallout={setRerender}
      />
      <PatternToastContainer />
    </ToggleProvider>
  )
}
