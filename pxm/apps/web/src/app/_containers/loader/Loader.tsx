import { CSSProperties } from 'react'

import styles from './loader.module.scss'

export type LoaderProps = {
  /** Optionally override the height style property */
  height?: CSSProperties['height']
  /** Optionally override the width style property */
  width?: CSSProperties['width']
}

const Loader = ({ height, width }: LoaderProps) => {
  return (
    <div
      className={styles.loader}
      style={{
        height,
        width,
      }}
    />
  )
}

export default Loader
