import { Accordion, AccordionItemProps } from '@amplifi-workspace/web-shared'

import styles from './accordion-container.module.scss'

// Recursive function to render nested accordion items
const renderNestedAccordion = (items: AccordionItemProps[]) => {
  return items.map((item, index) => (
    <Accordion
      key={index}
      title={item.title}
      defaultExpanded={item.defaultExpanded}
      nested={item.nested}
    >
      {Array.isArray(item.children) ? (
        <div>{renderNestedAccordion(item.children)}</div>
      ) : (
        <div>{item.children}</div>
      )}
    </Accordion>
  ))
}

export const renderAccordionData = (accordionData: AccordionItemProps[]) => {
  return (
    <div className={styles.accordionContainer}>
      {accordionData?.map((item: AccordionItemProps, index: number) => (
        <Accordion
          key={index}
          title={item.title}
          defaultExpanded={item.defaultExpanded}
          nested={item.nested}
        >
          {Array.isArray(item.children)
            ? renderNestedAccordion(item.children)
            : item.children}
        </Accordion>
      ))}
    </div>
  )
}
