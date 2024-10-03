import { ListLoading } from '@patterninc/react-ui'

import styles from './collections.module.scss'

export const CollectionLoading: React.FC = () => {
  return (
    <div className={styles.collectionLoading}>
      <ListLoading numberOfRows={10} />
    </div>
  )
}
