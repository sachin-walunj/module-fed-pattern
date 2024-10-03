import { useState } from 'react'

import { Button } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import { SearchSideDrawer } from './SearchSideDrawer'

export const SearchButton: React.FC = () => {
  const { t } = useTranslate('portal')
  const [isOpen, setIsOpen] = useState(false)

  const onToggle = (): void => {
    setIsOpen(!isOpen)
  }
  return (
    <>
      <Button onClick={onToggle}>{t('advancedSearch')}</Button>
      <SearchSideDrawer isOpen={isOpen} onClose={onToggle} />
    </>
  )
}
