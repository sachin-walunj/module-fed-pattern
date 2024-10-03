'use client'

import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import {
  FormFooter,
  MultiSelect,
  SideDrawer,
  TextInput,
} from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { CollectionCardType } from '../../../../_common/components/CollectionCard/CollectionCard'
import { getUsersList, User } from '../../../../_common/server/actions'

type ContentBriefSideDrawerProps = {
  isOpen: boolean
  closeCallout: () => void
  collection: CollectionCardType
  isEdit?: boolean
}

export function ContentBriefSideDrawer({
  isOpen,
  closeCallout,
  collection,
  isEdit = false,
}: ContentBriefSideDrawerProps) {
  const { t } = useTranslate('portal')

  const [contentBriefName, setContentBriefName] = useState('')
  const [selectedEmails, setSelectedEmails] = useState<
    (User & { display: string })[]
  >([])

  const {
    data: emailRecipients,
    isLoading: recipientsLoading,
    isError,
  } = useQuery({
    queryKey: ['emailRecipients'],
    queryFn: async () => {
      const response = await getUsersList()
      return response?.data.map((user) => ({
        ...user,
        display: `${user.name} (${user.email})`,
      }))
    },
  })

  const saveBrief = () => {
    closeCallout()
  }

  return (
    <SideDrawer
      isOpen={isOpen}
      closeCallout={closeCallout}
      headerContent={isEdit ? t('updateContentBrief') : t('newContentBrief')}
      footerContent={
        <FormFooter
          cancelButtonProps={{
            onClick: closeCallout,
          }}
          saveButtonProps={{
            onClick: saveBrief,
            children: isEdit ? c('saveChanges') : t('generateContentBrief'),
            styleType: 'primary-blue',
            disabled: isError || !contentBriefName.length || recipientsLoading,
          }}
        />
      }
    >
      <div className='flex flex-direction-column gap-16'>
        <TextInput
          type='text'
          stateName='contentBriefName'
          placeholder={t('enterContentBriefName')}
          labelText={t('contentBriefName')}
          value={contentBriefName}
          callout={(_, value) => {
            setContentBriefName(value.toString())
          }}
          autoFocus
          required
        />
        <MultiSelect
          labelKey='display'
          formLabelProps={{ label: t('shareWithOthers') }}
          options={emailRecipients ?? []}
          loading={recipientsLoading}
          selectedOptions={selectedEmails}
          callout={(selectedList) => {
            setSelectedEmails(selectedList)
          }}
          exposed
          resetSearch={recipientsLoading}
        />
      </div>
    </SideDrawer>
  )
}
