import { useMemo, useState } from 'react'

import moment from 'moment'

import {
  Alert,
  DatepickerNew,
  FormFooter,
  FormLabel,
  MultipleSelection,
  SideDrawer,
  TextInput,
  Toggle,
} from '@patterninc/react-ui'

import { useAppSelector } from '@amplifi-workspace/store'
import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { CollectionParentFolderSelect } from './CollectionParentFolderSelect'
import {
  BrowseTreeItem,
  ItemType,
} from '../../../../../../_common/types/collectionTypes'
import styles from '../../collections.module.scss'
import { NewCategoryData } from '../../DataLayer'
import { CollectionFolderTypePicker } from '../CollectionFolderTypePicker'

interface CollectionCreateFolderProps {
  isOpen: boolean
  onClose: () => void
  onSave: (props: NewCategoryData, type: ItemType) => void
  item?: BrowseTreeItem
}
export const CollectionCreateFolder: React.FC<CollectionCreateFolderProps> = ({
  isOpen,
  onClose,
  onSave: onSaveProps,
  item,
}) => {
  const { t } = useTranslate('portal')
  const regions = useAppSelector((state) => state?.user?.regions)
  const [folderType, setFolderType] = useState<ItemType>('category')
  const [name, setName] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [selectedRegions, setSelectedRegions] =
    useState<RegionSelect[]>(regions)
  const [additionalTitle, setAdditionalTitle] = useState('')
  const [parentFolders, setParentFolders] = useState<BrowseTreeItem[]>(
    item ? [item] : []
  )
  const [publishedStartDate, setPublishedStartDate] =
    useState<moment.Moment | null>(moment())
  const [publishedEndDate, setPublishedEndDate] =
    useState<moment.Moment | null>(null)

  const onSave = (): void => {
    onSaveProps(
      {
        isPublished,
        name,
        id: item?.id || '',
        parentId: item?.parent_id || '',
        parentCategory: item?.parent_category || [],
        publishedEndDate: publishedStartDate,
        publishedStartDate: publishedEndDate,
        regions: selectedRegions.map((region) => region.id),
        directParents: parentFolders.map((item) => item.id),
      },
      folderType
    )
    onClose()
  }

  return (
    <SideDrawer
      isOpen={isOpen}
      closeCallout={onClose}
      logoUrl={undefined}
      headerContent={t('createNewFolder')}
      footerContent={
        <FormFooter
          cancelButtonProps={{ onClick: onClose }}
          saveButtonProps={{
            onClick: onSave,
            styleType: 'primary-blue',
            //Topics must have parents
            disabled: folderType === 'topic' && parentFolders.length === 0,
          }}
        />
      }
      layerPosition={1}
    >
      <CollectionFolderTypePicker
        value={folderType}
        callout={(param) => setFolderType(param)}
      />
      <div className={styles.createContainer}>
        <CollectionCreateInfoBox folderType={folderType} />
        <div className={styles.createFormContainer}>
          <TextInput
            value={name}
            callout={(state, value) => setName(value as string)}
            labelText={c('name')}
            placeholder={c('name')}
          />
          {folderType === 'topic' ? (
            <TextInput
              value={additionalTitle}
              callout={(_, value) => setAdditionalTitle(value as string)}
              labelText={t('additionalTitle')}
              placeholder={t('additionalTitle')}
            />
          ) : null}
          <Toggle
            checked={isPublished}
            callout={(value) => setIsPublished(value)}
            formLabelProps={{
              label: c('published'),
              required: true,
              tooltip: {
                tooltipContent: t(
                  'toggleToPublishOrHideContentSetDateRangeForScheduledVisibility'
                ),
              },
            }}
          />
          <div>
            <FormLabel label={t('publishedDates')} />
            <DatepickerNew
              startDate={publishedStartDate}
              endDate={publishedEndDate}
              onDatesChange={(startDate, endDate) => {
                setPublishedStartDate(startDate)
                setPublishedEndDate(endDate)
              }}
              hasFutureDates
              appendToBody
              openDirection='up'
              anchorDirection='right'
            />
          </div>
          <CollectionCreateRegionsSelect
            regionValues={selectedRegions}
            callout={setSelectedRegions}
            regions={regions}
          />
          {folderType === 'topic' ? (
            <CollectionParentFolderSelect
              parentsValue={parentFolders}
              callout={(newParents) => setParentFolders(newParents)}
            />
          ) : null}
        </div>
      </div>
    </SideDrawer>
  )
}

interface CollectionCreateInfoBoxProps {
  folderType: ItemType
}
const CollectionCreateInfoBox: React.FC<CollectionCreateInfoBoxProps> = ({
  folderType,
}) => {
  const { t } = useTranslate('portal')
  const alertText = useMemo(
    () =>
      folderType === 'category'
        ? [
            'Can have only one parent Category Folder (due to inheritance abilities)',
            'Can have multiple Categories or Collection Folders as direct children',
            'Can force child Collection Folders to inherit: content, permissions, custom tabs, fields and data',
            "Can have its own 'Category' level content or just be used for navigational purposes",
          ]
        : [
            'Can be in multiple parent Category Folders',
            'Cannot have child folders',
            'May be forced to inherit: permissions, custom tabs, fields and data from a parent category',
            'Can have its own content and/or inherit content from a parent Category',
          ],
    [folderType]
  )
  return (
    <Alert
      text={
        <div className={styles.createInfoContainer}>
          <div>{t('thisFolderType')}</div>
          <ul>
            {alertText.map((text) => (
              <li>{text}</li>
            ))}
          </ul>
        </div>
      }
      type='info'
    />
  )
}

interface RegionSelect {
  id: string
  name: string
}
interface CollectionCreateRegionsSelectProps {
  regionValues: RegionSelect[]
  callout: (newRegion: RegionSelect[]) => void
  regions: RegionSelect[]
}
const CollectionCreateRegionsSelect: React.FC<
  CollectionCreateRegionsSelectProps
> = ({ regionValues, callout, regions }) => {
  const { t } = useTranslate('portal')
  return (
    <MultipleSelection
      options={regions.map((region) => region.name)}
      selectedOptions={regionValues.map((value) => value.name)}
      callout={(selectedList) =>
        callout(
          selectedList
            .map((listItem) =>
              regions.find((region) => region.name === listItem)
            )
            .filter((region) => region !== undefined) as RegionSelect[]
        )
      }
      labelText={c('regions')}
      labelTooltip={{
        tooltipContent: t(
          'selectRegionsToControlFolderVisibilityBasedOnUserPermissions'
        ),
      }}
      required={true}
      selectPlaceholder='Placeholder'
    />
  )
}
