'use client'
import { useState } from 'react'

import { useTranslate } from '@amplifi-workspace/web-shared'

import Products from './Products'
import MatchHeader from '../../_common/components/MatchHeader'

export function Match() {
  const [searchTerm, setSearchTerm] = useState<string>('')

  const { t } = useTranslate('portal')

  return (
    <>
      <MatchHeader
        search={searchTerm}
        setSearch={setSearchTerm}
        searchPlaceholder={t('matchSearchPlaceholder')}
      />

      <Products searchTerm={searchTerm} />
    </>
  )
}

export default Match
