'use client'
import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { Tabs } from '@patterninc/react-ui'

import { t } from '@amplifi-workspace/web-shared'

import { fetchSummary } from './action'
import MatchTable from './MatchTable'
import { SummaryResponseType } from './types'

type ProductsType = {
  searchTerm: string
}

const Products = ({ searchTerm }: ProductsType) => {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [totalCount, setTotalCount] = useState<number>(0)

  const { data } = useQuery<SummaryResponseType>({
    queryKey: ['matchSummary'],
    queryFn: async () => {
      const response = await fetchSummary({ marketplace: 'Amazon', code: 'US' })

      return response
    },
  })

  const renderMatchTable = () => {
    return (
      <MatchTable
        searchTerm={searchTerm}
        activeTab={activeTab}
        setAllTabCount={setTotalCount}
      />
    )
  }

  const setActiveTabDetails = (tab: number) => {
    if (tab === 0) {
      setActiveTab('all')
    } else {
      setActiveTab(tab === 1 ? 'need_cases' : 'need_publish')
    }
  }

  return (
    <Tabs
      tabs={[
        {
          id: 0,
          tabName: t('portal:matchAllTab'),
          content: renderMatchTable(),
          tag: totalCount,
        },
        {
          id: 1,
          tabName: t('portal:matchNeedCasesTab'),
          content: renderMatchTable(),
          tag: data ? data?.need_cases_count?.value : 0,
        },
        {
          id: 2,
          tabName: t('portal:matchNeedPublishTab'),
          content: renderMatchTable(),
          tag: data ? data?.need_publish_count?.value : 0,
        },
      ]}
      active={0}
      callout={(tab) => setActiveTabDetails(tab)}
    />
  )
}

export default Products
