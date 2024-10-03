import Loader from '../loader/Loader'

import styles from './header-skeleton.module.scss'

const HeaderSkeleton = (): JSX.Element => {
  return (
    <div className={styles.headerSkeleton}>
      <Loader height={24} width={200} />
      <Loader height={24} width={200} />
    </div>
  )
}

export default HeaderSkeleton
