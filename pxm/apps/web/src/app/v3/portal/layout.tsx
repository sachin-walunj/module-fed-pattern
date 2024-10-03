import { CollectionsProvider } from '@amplifi-workspace/home'
import { fetchCollectionItems } from '@amplifi-workspace/home/server'

import { getConfigState, getSession } from '../../../server/actions'

async function PortalLayout({ children }: { children: React.ReactNode }) {
  const sessionData = await getSession()
  const configState = await getConfigState()
  const items = await fetchCollectionItems({
    user: sessionData,
    roleVisibility: configState.role_visibility,
    payload: undefined,
  })

  return (
    <CollectionsProvider initialCollectionItems={items}>
      {children}
    </CollectionsProvider>
  )
}

export default PortalLayout
