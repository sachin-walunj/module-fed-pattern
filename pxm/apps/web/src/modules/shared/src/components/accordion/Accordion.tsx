'use client'
import { useState } from 'react'

import { Icon } from '@patterninc/react-ui'

import styles from './accordion.module.scss'

export interface AccordionItemProps {
  title: string
  children: JSX.Element | AccordionItemProps[]
  defaultExpanded?: boolean
  nested?: boolean
}

export interface AccordionProps {
  title: string
  children: JSX.Element | JSX.Element[]
  defaultExpanded?: boolean
  nested?: boolean
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultExpanded,
  nested = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded || false)

  const toggleAccordion = () => {
    setExpanded(!expanded)
  }

  return (
    <div
      className={`${
        nested ? styles.nestedAccordionItem : styles.accordionItem
      }`}
    >
      <div
        className={`${styles.accordionHeader} ${
          expanded ? styles.activeHeader : ''
        }`}
        onClick={toggleAccordion}
      >
        {title}
        <Icon
          icon='popoverTriangle'
          size='14px'
          customClass={`${styles.caret} ${expanded ? styles.active : ''}`}
        />
      </div>
      {expanded && <div className={styles.accordionContent}>{children}</div>}
    </div>
  )
}
