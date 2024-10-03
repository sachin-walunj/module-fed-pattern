import React, { useState } from 'react'

import {
  Button,
  FormLabel,
  notEmpty,
  TagInput,
  Toggle,
  TrimText,
} from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import { SelectButton } from './SelectButton'
import { BrowseTreeItem } from '../../../../_common/types/collectionTypes'
import { useCollectionTreeItem } from '../../categoryFolderPicker/collections/CollectionTreeItem'
import { CollectionParentSelectSideDrawer } from '../../categoryFolderPicker/collections/options/createFolder/CollectionParentFolderSelect'

export type UploadSettingsProps = {
  tags: string[]
  setTags: React.Dispatch<React.SetStateAction<string[]>>
  mainFolder: BrowseTreeItem | null
  setMainFolder: React.Dispatch<React.SetStateAction<BrowseTreeItem | null>>
  additionalFolders: BrowseTreeItem[]
  setAdditionalFolders: React.Dispatch<React.SetStateAction<BrowseTreeItem[]>>
  enableTagging: boolean
  setEnableTagging: React.Dispatch<React.SetStateAction<boolean>>
}

export function UploadSettings({
  tags,
  setTags,
  mainFolder,
  setMainFolder,
  additionalFolders,
  setAdditionalFolders,
  enableTagging,
  setEnableTagging,
}: UploadSettingsProps) {
  const { t } = useTranslate('portal')
  const [isMainFolderOpen, setIsMainFolderOpen] = useState(false)
  const [isAdditionalFolderOpen, setIsAdditionalFolderOpen] = useState(false)
  const [selectedMainFolder, setSelectedMainFolder] = useState<BrowseTreeItem>()
  const [selectedAdditionalFolders, setSelectedAdditionalFolders] = useState<
    BrowseTreeItem[]
  >([])
  const items = useCollectionTreeItem({ showTopics: true })

  return (
    <div className='pt-32 flex flex-direction-column gap-16'>
      <Toggle
        formLabelProps={{
          label: t('enableTagging'),
        }}
        checked={enableTagging}
        callout={(value) => {
          setEnableTagging(value)
        }}
      />
      <div>
        <FormLabel
          label={t('primaryFolder')}
          tooltip={{ tooltipContent: t('primaryFolderSelectTooltip') }}
        />
        <SelectButton
          hasValue={notEmpty(mainFolder?.name)}
          onClick={() => {
            setIsMainFolderOpen(true)
          }}
        >
          {notEmpty(mainFolder?.name)
            ? mainFolder?.name
            : t('selectPrimaryFolder')}
        </SelectButton>
        <CollectionParentSelectSideDrawer
          isOpen={isMainFolderOpen}
          onClose={() => setIsMainFolderOpen(false)}
          onSave={(item) => {
            setIsMainFolderOpen(false)
            setMainFolder(item)
            setSelectedMainFolder(item)
          }}
          selectedItem={selectedMainFolder}
        />
      </div>
      <div>
        <FormLabel
          label={t('additionalFolders')}
          tooltip={{ tooltipContent: t('additionalFoldersTooltip') }}
          disabled={selectedMainFolder === undefined}
        />
        <SelectButton
          hasValue={additionalFolders.length > 0}
          onClick={() => {
            setIsAdditionalFolderOpen(true)
          }}
          disabled={selectedMainFolder === undefined}
        >
          {additionalFolders.length > 0 ? (
            <TrimText
              text={additionalFolders?.map((f) => f.name).join(', ')}
              limit={30}
            />
          ) : (
            t('selectAdditionalFolders')
          )}
        </SelectButton>
        <CollectionParentSelectSideDrawer
          isOpen={isAdditionalFolderOpen}
          onClose={() => setIsAdditionalFolderOpen(false)}
          onSave={(_item) => {
            setAdditionalFolders(selectedAdditionalFolders)
            setIsAdditionalFolderOpen(false)
          }}
          selectedItem={selectedMainFolder}
          checkedItems={selectedAdditionalFolders}
          setCheckedItems={setSelectedAdditionalFolders}
        />
      </div>
      <TagInput
        tags={tags}
        setTags={setTags}
        placeholder={t('addTag')}
        formLabelProps={{
          label: t('tags'),
          tooltip: { tooltipContent: t('tagsTooltip') },
        }}
      />
      <div className='flex justify-content-center align-items-center bdrr-4 bgc-lighter-gray py-8'>
        <Button
          styleType='secondary'
          onClick={() => {
            /* TODO: open advanced settings drawer */
          }}
        >
          {t('advancedSettings')}
        </Button>
      </div>
    </div>
  )
}
