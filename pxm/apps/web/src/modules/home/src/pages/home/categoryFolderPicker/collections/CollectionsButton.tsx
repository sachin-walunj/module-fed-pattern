'use client'
import { Button, Icon, useIsMobileView } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import { useCollectionsContext } from './CollectionsProvider'

export const CollectionsButton: React.FC = () => {
  const { t } = useTranslate('portal')
  const { toggleSideDrawer } = useCollectionsContext()
  return (
    <Button as='unstyled' onClick={toggleSideDrawer}>
      {useIsMobileView() ? (
        <Icon icon='folder' customClass='svg-purple' />
      ) : (
        <div className='flex gap-8 mr-40'>
          <Icon icon='folder' customClass='svg-purple' />{' '}
          <span>{t('allCategories')}</span>
        </div>
      )}
    </Button>
  )
}
