import { c, Divider } from '@amplifi-workspace/web-shared'

import { CollectionsButton } from '../home/categoryFolderPicker/collections/CollectionsButton'
import { LightboxProvider } from '../home/lightbox'
import { LightboxContainer } from '../home/lightbox/LightboxContainer'

const LeftNavbarMobileHeader = (): JSX.Element => {
  return (
    <div className='flex justify-content-between'>
      <div className='flex flex-column justify-center p-20'>{c('pattern')}</div>
      <div className='flex align-items-center gap-16'>
        <Divider />
        <CollectionsButton />
        <Divider />
        <LightboxProvider>
          <LightboxContainer />
        </LightboxProvider>
      </div>
    </div>
  )
}

export default LeftNavbarMobileHeader
