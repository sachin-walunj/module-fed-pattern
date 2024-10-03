import { useEffect, useState } from 'react'

import { useMutation } from '@tanstack/react-query'

import { toast } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import { assignListingFromTopic } from '../../../collectionFolderDetails'
import { AddListingDrawer } from '../../../collectionFolderDetails/relationships/listings/AddListing'
const ProductListings = ({
  isOpen,
  topicId,
  closeCallback,
}: {
  isOpen: boolean
  topicId: string
  closeCallback?: () => void
}) => {
  const { t } = useTranslate('portal')
  const actionType = 'add'
  const [isOpenParent, setIsOpenParent] = useState(false)
  const [isProceessing, setIsProceessing] = useState(false)
  const [selectedListing, setSelectedListing] = useState<
    {
      name: string
      value: string
    }[]
  >([])

  useEffect(() => {
    setIsOpenParent(isOpen)
  }, [isOpen])

  const onClose = () => {
    setIsOpenParent(false)
    setSelectedListing([])
    closeCallback?.()
  }

  const { mutate: assignSelectedListing } = useMutation({
    mutationFn: assignListingFromTopic,
    onMutate: () => {
      setIsProceessing(true)
    },
    onSuccess: () => {
      toast({
        type: 'success',
        message: t('assignedListingSuccessfully'),
      })
      onClose()
      setIsProceessing(false)
    },
    onError: () => {
      toast({
        type: 'error',
        message: t('assignListingFailed'),
      })
      setIsProceessing(false)
    },
  })

  const assignReplace = () => {
    const newList: string[] = []
    selectedListing?.map((listing) => newList.push(listing.value))
    const payload = {
      ids: newList,
      topic_id: topicId,
    }
    assignSelectedListing(payload)
  }

  const handleSave = () => {
    assignReplace()
  }

  return (
    <AddListingDrawer
      isOpen={isOpenParent}
      onClose={onClose}
      onSave={handleSave}
      selectedListing={selectedListing}
      setSelectedListing={setSelectedListing}
      actionType={actionType}
      isProceessing={isProceessing}
    ></AddListingDrawer>
  )
}

export default ProductListings
