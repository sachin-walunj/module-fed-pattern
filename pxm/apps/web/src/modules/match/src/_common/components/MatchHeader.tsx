'use client'
import { useState } from 'react'

import { NewSelect, PageHeader } from '@patterninc/react-ui'

interface MatchHeaderProps {
  search: string
  setSearch: (e: string) => void
  searchPlaceholder: string
  filter?: React.ReactNode
}

interface Marketplace {
  id: string
  name: string
}

const AVAILABLE_MARKETPLACES = [{ id: '1', name: 'Amazon-US' }]

const MatchHeader = ({
  search,
  setSearch,
  searchPlaceholder,
  filter,
}: MatchHeaderProps) => {
  const [selectedMarkteplace, setSelectedMarketplace] = useState<Marketplace>({
    id: '1',
    name: 'Amazon-US',
  })

  return (
    <PageHeader
      search={{
        value: search,
        onChange: (searchInputText) => {
          setSearch(searchInputText)
        },
        placeholder: searchPlaceholder,
      }}
      rightSectionChildren={
        <div className='flex gap-16'>
          <NewSelect
            options={AVAILABLE_MARKETPLACES}
            optionKeyName='id'
            labelKeyName='name'
            selectedItem={selectedMarkteplace || { id: '', name: '' }}
            onChange={(field: Marketplace) => setSelectedMarketplace(field)}
          />
          {filter && filter}
        </div>
      }
    />
  )
}

export default MatchHeader
