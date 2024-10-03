import { Picker } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import { ItemType } from '../../../../../_common/types/collectionTypes'

interface CollectionFolderTypePickerProps {
  value: ItemType
  callout: (value: ItemType) => void
}
export const CollectionFolderTypePicker: React.FC<
  CollectionFolderTypePickerProps
> = ({ value, callout }) => {
  interface FolderTypeOption {
    id: number
    text: string
    value: ItemType
  }
  const { t } = useTranslate('portal')
  const options: FolderTypeOption[] = [
    {
      id: 1,
      text: t('categoryFolder'),
      value: 'category',
    },
    {
      id: 2,
      text: t('collectionFolder'),
      value: 'topic',
    },
  ]
  return (
    <Picker
      selected={value}
      options={options}
      callout={callout}
      labelText={t('folderType')}
    />
  )
}
