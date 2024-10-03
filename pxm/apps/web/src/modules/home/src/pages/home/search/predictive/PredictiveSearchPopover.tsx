import { useRef, useState } from 'react'

import { Popover } from '@patterninc/react-ui'

import { useAppSelector } from '@amplifi-workspace/store'

import { PredictiveSearch, PredictiveSearchBucket } from './PredictiveSearch'
import { getSourceFromSearchHit } from '../../../../utils/productSearch'
import { useCollectionRouter } from '../../_common/hooks/CollectionRouter'
import { searchAutocomplete } from '../../homePageHeader/actions'

interface PredictiveSearchPopoverProps {
  children: (props: {
    onSearch: (value: string) => void
    setVisible: (value: boolean) => void
    popoverRef: React.MutableRefObject<Element | null>
  }) => JSX.Element
}
export const PredictiveSearchPopover: React.FC<
  PredictiveSearchPopoverProps
> = ({ children }) => {
  const popoverRef = useRef<Element | null>(null)
  const [searchBucket, setSearchBucket] = useState<PredictiveSearchBucket>({
    media: [],
    category: [],
    topic: [],
  })
  const { folderId } = useCollectionRouter()
  const user = useAppSelector((state) => state.user)
  const config = useAppSelector((state) => state.config)

  const onSearch = (search: string, setVisible: (value: boolean) => void) => {
    setVisible(false)
    searchAutocomplete({
      payload: { search, parentCategory: folderId },
      user,
      roleVisibility: config.role_visibility,
    }).then((result) => {
      const newSearchBucket: PredictiveSearchBucket = {
        media: getSourceFromSearchHit(
          result.aggregations.autocomplete.buckets.media.top.hits
        ),
        category: getSourceFromSearchHit(
          result.aggregations.autocomplete.buckets.browse_category.top.hits
        ),
        topic: getSourceFromSearchHit(
          result.aggregations.autocomplete.buckets.topics.top.hits
        ),
      }
      setSearchBucket(newSearchBucket)

      //Only show the popover when there is content to show
      setVisible(
        newSearchBucket.category.length > 0 ||
          newSearchBucket.topic.length > 0 ||
          newSearchBucket.media.length > 0
      )
    })
  }

  return (
    <Popover
      popoverContent={<PredictiveSearch value={searchBucket} />}
      tippyProps={{ placement: 'bottom', reference: popoverRef }}
    >
      {({ setVisible }) =>
        children({
          onSearch(value) {
            if (value) {
              onSearch(value, setVisible)
            } else {
              setVisible(false)
            }
          },
          setVisible,
          popoverRef,
        })
      }
    </Popover>
  )
}
