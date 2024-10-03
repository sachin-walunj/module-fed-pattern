// Necessary if using App Router to ensure this file runs on the client
'use client'

import { datadogRum } from '@datadog/browser-rum'

datadogRum.init({
  applicationId: '64441200-917b-44dd-91b1-5c14b399c42c',
  clientToken: 'pub3825706ad22e4066ab41d860663c5db3',
  // `site` refers to the Datadog site parameter of your organization
  // see https://docs.datadoghq.com/getting_started/site/
  site: 'datadoghq.com',
  // ToDo: get instance name dynamically from configuration service
  service: 'amplifi-workspace-staging',
  // ToDo: get environment name dynamically from configuration service
  env: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  // Specify a version number to identify the deployed version of your application in Datadog
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
})

export function DatadogInit() {
  // Render nothing - this component is only included so that the init code
  // above will run client-side
  return null
}
