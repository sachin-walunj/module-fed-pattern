'use client'
import { Checkbox, Icon } from '@patterninc/react-ui'

import { Filters } from '../../utils/usePageHeader'

export const RenderFilterChildren =
  (filters: Filters, t: (value: string) => string) =>
  ({ isOpen, close }: { isOpen?: boolean; close?: () => void }) => {
    if (!isOpen) return null

    if (filters.searchtype === 'files') {
      return (
        <div>
          <div className='mb-16'>
            <span className='fs-12'>{t('additionalFilters')}</span>
          </div>
          <div className='mb-16 flex'>
            <Checkbox label={t('onlyShowHeroImages')}></Checkbox>
            <span className='required-asterisk fc-red ml-4'>*</span>
            <Icon icon='info' size='12px' customClass='svg-blue ml-8' />
          </div>
          <div className='mb-16 flex'>
            <Checkbox label={t('limitSearchToFileNames')}></Checkbox>
            <span className='required-asterisk fc-red ml-4'>*</span>
            <Icon icon='info' size='12px' customClass='svg-blue ml-8' />
          </div>
        </div>
      )
    } else if (filters.searchtype === 'folders') {
      return (
        <div>
          <div className='mb-16'>
            <span className='fs-12'>{t('adminSpecificFilters')}</span>
          </div>
          <div className='mb-16 flex'>
            <Checkbox label={t('onlyShowFoldersWithNoFiles')}></Checkbox>
            <span className='required-asterisk fc-red ml-4'>*</span>
            <Icon icon='info' size='12px' customClass='svg-blue ml-8' />
          </div>
          <div className='mb-16 flex'>
            <Checkbox label={t('onlyShowFoldersWithNoPreviewImage')}></Checkbox>
            <span className='required-asterisk fc-red ml-4'>*</span>
            <Icon icon='info' size='12px' customClass='svg-blue ml-8' />
          </div>
          <div className='mb-16 flex'>
            <Checkbox label={t('hideVariantProducts')}></Checkbox>
            <span className='required-asterisk fc-red ml-4'>*</span>
            <Icon icon='info' size='12px' customClass='svg-blue ml-8' />
          </div>
        </div>
      )
    } else {
      return null
    }
  }
