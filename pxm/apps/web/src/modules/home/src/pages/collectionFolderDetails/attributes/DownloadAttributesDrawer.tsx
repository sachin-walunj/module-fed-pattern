'use client'
import React from 'react'

import { Button, MultiSelect, SideDrawer } from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { AttributeGroup } from './actions'
interface DownloadAttributesDrawerProps {
  isOpen: boolean
  onClose: () => void
  onDownload: () => void
  attributeGroupsNew: AttributeGroup[]
  selectedDownloadAttGroups: { name: string }[]
  setSelectedDownloadAttGroups: (selectedList: { name: string }[]) => void
}

export const DownloadAttributesDrawer: React.FC<
  DownloadAttributesDrawerProps
> = ({
  isOpen,
  onClose,
  onDownload,
  attributeGroupsNew,
  selectedDownloadAttGroups,
  setSelectedDownloadAttGroups,
}) => {
  const { t } = useTranslate('portal')

  return (
    <SideDrawer
      footerContent={
        <div className='flex justify-content-end'>
          <Button
            styleType='primary-blue'
            onClick={onDownload}
            disabled={!selectedDownloadAttGroups.length}
          >
            {c('download')}
          </Button>
        </div>
      }
      headerContent={t('downloadAttributes')}
      isOpen={isOpen}
      closeCallout={onClose}
    >
      <MultiSelect
        maxHeight='500px'
        exposed
        emptyStateProps={{
          primaryText: t('noAttributeGroupFound'),
          secondaryText: t('trySearchingForDifferentName'),
        }}
        formLabelProps={{
          label: t('selectAttributeGroups'),
          required: true,
          tooltip: {
            tooltipContent: t('selectOneOrMoreAttributeGroup'),
          },
        }}
        options={attributeGroupsNew.map((group) => ({
          name: group.name || '',
        }))}
        labelKey='name'
        callout={(selectedList) => {
          setSelectedDownloadAttGroups([...selectedList])
        }}
        searchBarProps={{
          placeholder: t('searchAttributeGroups'),
          value: '',
          show: true,
        }}
        selectedOptions={selectedDownloadAttGroups}
      />
    </SideDrawer>
  )
}
