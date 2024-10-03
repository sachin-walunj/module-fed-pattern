import AuthUpdater from './AuthUpdater'

import styles from './syndication.module.scss'

/* eslint-disable-next-line */
export interface SyndicationProps {}

export function Syndication(props: SyndicationProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Syndication!</h1>
      <AuthUpdater />
    </div>
  )
}

export default Syndication
