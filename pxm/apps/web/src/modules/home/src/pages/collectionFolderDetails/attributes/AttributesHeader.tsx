'use client'
import { APP_LOGOS, PageHeader } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import styles from './attributes-tab.module.scss'

export function AttributesHeader() {
  const { t } = useTranslate('portal')
  return (
    <PageHeader
      leftSectionChildren={
        <div className='flex gap-16'>
          <img src={APP_LOGOS.PXM.logo} alt='Logo' className={styles.logo} />
          <PageHeader.HeaderDivider />
        </div>
      }
      search={{
        placeholder: t('searchAttributes'),
        value: '',
        onChange: (searchInputText) => {
          // Handle search input changes here
        },
        keyUpCallout: () => {
          // Handle key-up event in the search input here
        },
      }}
    />
  )
}
