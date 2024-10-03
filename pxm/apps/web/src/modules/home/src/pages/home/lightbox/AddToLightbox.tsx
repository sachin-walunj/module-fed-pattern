'use client'
import { Tabs } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import AddToExistingLightbox from './AddToExistingLightbox'
import CreateNewLightbox from './createNewLightbox/CreateNewLightbox'
import {
  LightboxState,
  UpdateLightboxStateOptions,
} from '../../../_common/types/lightboxTypes'

interface AddToLightboxProps {
  setActiveTab: (tab: number) => void
  lightboxState: LightboxState
  updateLightboxState: (arg0: UpdateLightboxStateOptions) => void
}

export const initialLightboxState: LightboxState = {
  lightboxName: '',
  checkedViewItems: [],
  checkedEditItems: [],
}

export const AddToLightbox: React.FC<AddToLightboxProps> = ({
  setActiveTab,
  lightboxState,
  updateLightboxState,
}) => {
  const { t } = useTranslate('portal')
  return (
    <div>
      <Tabs
        equalWidth
        active={0}
        tabs={[
          {
            content: (
              <CreateNewLightbox
                updateLigthboxState={updateLightboxState}
                lightboxState={lightboxState}
              />
            ),
            id: 0,
            tabName: t('createNew'),
          },
          {
            content: <AddToExistingLightbox />,
            id: 1,
            tabName: t('addToExisting'),
          },
        ]}
        callout={setActiveTab}
      />
    </div>
  )
}
