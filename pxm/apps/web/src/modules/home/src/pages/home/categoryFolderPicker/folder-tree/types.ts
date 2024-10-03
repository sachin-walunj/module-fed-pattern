import { IconStringList } from '@patterninc/react-ui'

export type FolderTreeDataItem<T> = {
  id: string
  label: string
  data: T
  type: IconStringList
  children: FolderTreeDataItem<T>[]
  onClick?: (item: T) => Promise<void>
  optionsContent?: FolderItemOptionsComponent<T>
  isOpen?: boolean
  isSelected?: boolean
  //The parts of the label to highlight for search
  highlightLabel?: string
}

export type FolderItemOptionsComponent<T> = (props: {
  item: T
  onClose: () => void
}) => JSX.Element
