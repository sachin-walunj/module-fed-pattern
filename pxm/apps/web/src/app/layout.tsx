import { type Metadata } from 'next'

import { cookies } from 'next/headers'

import { CollectionsProvider } from '@amplifi-workspace/home'
import { MediaProvider } from '@amplifi-workspace/home'
import { fetchCollectionItems } from '@amplifi-workspace/home/server'

import {
  BreadcrumbProvidercontainer,
  FeatureToggleContainer,
  HeaderContainer,
  LeftNavContainer,
  QueryStateProvider,
  TranslationProvider,
} from './_containers'
import {
  DatadogInit,
  ReactQueryProvider,
  StoreProvider,
  UserTypes,
} from '../lib'
import {
  getConfig,
  getConfigState,
  getRegions,
  getRoles,
  getSession,
  getVariants,
} from '../server/actions'
import './global.css'

export const metadata: Metadata = {
  title: 'Welcome to Amplifi',
  description: 'Amplifi is a platform for DAM and PIM.',
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      url: '/favicons/favicon-32x32.png',
      sizes: '32x32',
    },
    {
      rel: 'icon',
      type: 'image/png',
      url: '/favicons/favicon-16x16.png',
      sizes: '16x16',
    },
    {
      rel: 'apple-touch-icon',
      type: 'image/png',
      url: '/favicons/apple-icon-180x180.png',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      type: 'application/manifest+json',
      url: '/favicons/manifest.json',
    },
  ],
}

export interface LayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: LayoutProps) {
  const cookieStore = cookies()
  const sessionData: UserTypes | any = cookieStore.has('access_token')
    ? await getSession()
    : null

  const configData = await getConfig()
  const regionData = await getRegions()
  const roleData = await getRoles()
  const configState = await getConfigState()
  const variantsToDownload = await getVariants()

  const items = await fetchCollectionItems({
    user: sessionData,
    roleVisibility: configState.role_visibility,
    payload: undefined,
  })

  return (
    <html lang='en'>
      <body>
        <DatadogInit />
        <FeatureToggleContainer>
          <TranslationProvider>
            <StoreProvider
              sessionData={sessionData}
              configData={{
                ...configData,
                roles: roleData,
                regions: regionData,
              }}
              variantsToDownload={variantsToDownload}
            >
              <QueryStateProvider>
                <ReactQueryProvider>
                  <div className='App relative'>
                    {/* LeftNavContainer and HeaderContainer Components need the information in 
                    CollectionsProvider, So both of them are wrapped in it */}
                    <MediaProvider>
                      <BreadcrumbProvidercontainer>
                        <CollectionsProvider initialCollectionItems={items}>
                          <LeftNavContainer />
                          <main className='grid app-content-layout'>
                            <HeaderContainer />
                            <div className='App-content pxm-app-content p-20'>
                              {children}
                            </div>
                          </main>
                        </CollectionsProvider>
                      </BreadcrumbProvidercontainer>
                    </MediaProvider>
                  </div>
                </ReactQueryProvider>
              </QueryStateProvider>
            </StoreProvider>
          </TranslationProvider>
        </FeatureToggleContainer>
      </body>
    </html>
  )
}
