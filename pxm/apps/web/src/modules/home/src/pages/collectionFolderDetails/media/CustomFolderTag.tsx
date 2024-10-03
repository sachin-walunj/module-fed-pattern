import React from 'react'

import { Button, Icon } from '@patterninc/react-ui'

import styles from './custom-folder-tags.module.scss'

interface CustomFolderTagProps {
  label: string
  isPrimary: boolean
  onRemove: () => void
  onTogglePrimary: () => void
}

const CustomFolderTag: React.FC<CustomFolderTagProps> = ({
  label,
  isPrimary,
  onRemove,
  onTogglePrimary,
}) => {
  return (
    <div className={styles.customFolderTag}>
      <span className={styles.tagText} title={label}>
        {label}
      </span>
      <div className={styles.iconContainer}>
        <Button
          onClick={onTogglePrimary}
          className={styles.iconButton}
          as='unstyled'
        >
          <Icon
            icon={isPrimary ? 'starSolid' : 'star'}
            customClass='svg-blue'
            size='16px'
          />
        </Button>

        <Button onClick={onRemove} className={styles.iconButton} as='unstyled'>
          <Icon icon='close' customClass='svg-blue' size='16px' />
        </Button>
      </div>
    </div>
  )
}

export default CustomFolderTag
