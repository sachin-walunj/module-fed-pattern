import { useEffect, useMemo, useState } from 'react'

import { CollectionCardType } from '../components/CollectionCard/CollectionCard'
import { Collection } from '../types/collectionTypes'

export function useCollectionCardCheckboxes({ data }: { data: Collection[] }) {
  const addCheckedProperty = (
    data: Collection[],
    checked: boolean
  ): CollectionCardType[] => data.map((item) => ({ ...item, checked }))

  const [checkAll, setCheckAll] = useState<boolean>(false),
    checkAllCallout = (checked: boolean) => {
      setCheckAll(checked)
      setCollectionCards(addCheckedProperty(data, checked))
    }

  const [collectionCards, setCollectionCards] = useState<CollectionCardType[]>(
      addCheckedProperty(data, false)
    ),
    onCheckCallout = (name: string, checked: boolean) => {
      setCollectionCards((prev) => {
        if (checkAll && !checked) setCheckAll(false)
        if (
          !checkAll &&
          prev
            .filter((item) => item.name !== name)
            .every((item) => item.checked) &&
          checked
        )
          setCheckAll(true)
        return prev.map((item) =>
          item.name === name ? { ...item, checked } : item
        )
      })
    }

  useEffect(() => {
    setCollectionCards(addCheckedProperty(data, false))
    setCheckAll(false)
  }, [data])

  const checkedCards = useMemo(() => {
    return collectionCards.filter((card) => card.checked)
  }, [collectionCards])

  return {
    checkAll,
    checkAllCallout,
    collectionCards,
    onCheckCallout,
    checkedCards,
  }
}
