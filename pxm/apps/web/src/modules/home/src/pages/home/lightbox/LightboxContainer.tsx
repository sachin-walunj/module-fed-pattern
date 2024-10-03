'use client'
import { useContext, useEffect, useState } from 'react'

import { useMutation } from '@tanstack/react-query'

import {
  Button,
  FormFooter,
  Icon,
  SideDrawer,
  toast,
  useIsMobileView,
} from '@patterninc/react-ui'

import {
  AppDispatch,
  RootState,
  toggleLightboxDrawer,
  useAppDispatch,
  useAppSelector,
} from '@amplifi-workspace/store'
import { useTranslate } from '@amplifi-workspace/web-shared'

import {
  AddToLightboxViaCreateNew,
  AddToLightboxViaCreateNewPayload,
  assignItemsToLightbox,
  assignItemsToLightboxPayload,
  assignItemsToLightboxResponse,
  fetchLightboxItemResponse,
} from './actions'
import { AddToLightbox } from './AddToLightbox'
import { Lightbox } from './Lightbox'
import { LightboxContext } from './lightboxContext'
import { LightboxContextType } from './types'
import {
  LightboxState,
  UpdateLightboxStateOptions,
} from '../../../_common/types/lightboxTypes'

const initialLightboxState: LightboxState = {
  lightboxName: '',
  checkedViewItems: [],
  checkedEditItems: [],
}

export const LightboxContainer = (): JSX.Element => {
  const { selectedLightbox, setSelectedLightbox } = useContext(
    LightboxContext
  ) as LightboxContextType
  const dispatch: AppDispatch = useAppDispatch()

  const lightboxIsOpen = useAppSelector(
    (state: RootState) => state.lightbox?.lightboxIsOpen
  )
  const addToLightboxIsOpen = useAppSelector(
    (state: RootState) => state.lightbox?.AddToLightboxIsOpen
  )
  const selectedProducts = useAppSelector(
    (state: RootState) => state.lightbox?.selectedProducts
  )
  const userId = useAppSelector((state: RootState) => state.user?.user_id)

  const [sideDrawerActiveTab, setSideDrawerActiveTab] = useState<number>(0)
  const [lightboxState, setLightboxState] =
    useState<LightboxState>(initialLightboxState)

  const { t } = useTranslate('portal')

  // get all lightbox list from store
  const lightboxList = useAppSelector(
    (state: RootState) => state.lightbox?.myLightboxList
  )

  useEffect(() => {
    lightboxList?.length > 0 && setSelectedLightbox(lightboxList[0])
  }, [lightboxList, setSelectedLightbox])

  const { mutate: assignToLightbox, isPending: isAssigning } = useMutation<
    assignItemsToLightboxResponse,
    Error,
    assignItemsToLightboxPayload,
    unknown
  >({
    mutationFn: assignItemsToLightbox,
    onSuccess: () => {
      toggleAddToLightboxDrawer()
      toggleLightbox()
      toast({
        type: 'success',
        message: t('assetsAddedToLightboxSuccessfully'),
      })
    },
    onError: (error) => {
      toast({
        type: 'error',
        message: t('failedToAssignItemsToLightbox'),
      })
    },
  })

  const { mutate: createLightbox, isPending: isCreatingLightbox } = useMutation<
    fetchLightboxItemResponse,
    Error,
    AddToLightboxViaCreateNewPayload,
    unknown
  >({
    mutationFn: AddToLightboxViaCreateNew,
    onSuccess: (response) => {
      console.log('response', response)
      setSelectedLightbox({
        id: response.id,
        name: response.name,
        created_date: response.created_date,
        hostname: response.hostname,
        is_publishable_to_channels: response.is_publishable_to_channels,
        items: response.items,
        updated_date: response.updated_date,
        updated_by: response.updated_by,
        user_id: response.user_id,
        read_roles: response.read_roles,
        write_roles: response.write_roles,
      })
      toggleAddToLightboxDrawer()
      toggleLightbox()
      toast({
        type: 'success',
        message: t('lightboxCreatedSuccessfully', { name: response?.name }),
      })
    },
    onError: (error: any) => {
      toast({
        type: 'error',
        message:
          error?.response?.data?.message || t('lightboxNameAlreadyExists'),
      })
    },
  })

  const updateLightboxState = ({
    isName = false,
    lightboxName = '',
    itemsType = 'checkedViewItems',
    roles = [],
    isRolesAdd = false,
    isFlushOut = false,
  }: UpdateLightboxStateOptions) => {
    if (isName) {
      setLightboxState((prevState) => {
        return { ...prevState, lightboxName: lightboxName }
      })
    } else if (isFlushOut) {
      setLightboxState((prevState) => {
        return { ...prevState, [itemsType]: [] }
      })
    } else if (isRolesAdd) {
      setLightboxState((prevState) => {
        return {
          ...prevState,
          [itemsType]: [...new Set([...prevState[itemsType], ...roles])],
        }
      })
    } else {
      setLightboxState((prevState) => {
        return {
          ...prevState,
          [itemsType]: prevState[itemsType].filter(
            (items: string) => !roles.includes(items)
          ),
        }
      })
    }
  }

  const toggleLightbox = () =>
    dispatch(toggleLightboxDrawer({ parent: 'lightbox' }))
  const toggleAddToLightboxDrawer = () =>
    dispatch(toggleLightboxDrawer({ parent: 'AddToLightbox' }))

  const handleCancelAddToLightbox = () => {
    setLightboxState(initialLightboxState)
    toggleAddToLightboxDrawer()
  }
  const handleSubmitAddToLightbox = () => {
    if (sideDrawerActiveTab === 0) {
      // Creating a new lightbox
      if (lightboxState.lightboxName && selectedProducts.length > 0) {
        const payload: AddToLightboxViaCreateNewPayload = {
          items: selectedProducts.map((product) => ({
            id: product.id,
            name: product.name,
            type: product.type,
          })),
          name: lightboxState.lightboxName,
          read_roles: lightboxState.checkedViewItems,
          write_roles: lightboxState.checkedEditItems,
          metadata: {
            initiated_by: userId,
          },
        }

        createLightbox(payload)
      }
    } else {
      // Adding to an existing lightbox
      if (selectedLightbox && selectedProducts.length > 0) {
        const payload: assignItemsToLightboxPayload = {
          entity: 'items',
          entity_id: selectedLightbox.id,
          ids: selectedProducts.map((product) => ({
            id: product.id,
            name: product.name,
            type: product.type,
          })),
        }

        assignToLightbox(payload)
      }
    }
  }

  return (
    <>
      <Button as='unstyled' onClick={toggleLightbox}>
        {useIsMobileView() ? (
          <Icon icon='layers' customClass='svg-purple' />
        ) : (
          <div className='flex gap-8'>
            <Icon icon='layers' customClass='svg-purple' />{' '}
            <span>{t('lightbox')}</span>
          </div>
        )}
      </Button>
      <SideDrawer
        closeCallout={toggleLightbox}
        footerContent={<Lightbox.Footer />}
        headerContent='Lightbox'
        isOpen={lightboxIsOpen}
      >
        <Lightbox />
      </SideDrawer>
      <SideDrawer
        footerContent={
          <FormFooter
            cancelButtonProps={{ onClick: handleCancelAddToLightbox }}
            saveButtonProps={{
              children:
                sideDrawerActiveTab === 0
                  ? t('createNewLightbox')
                  : t('addToLightbox'),
              onClick: handleSubmitAddToLightbox,
              disabled:
                isAssigning ||
                isCreatingLightbox ||
                (sideDrawerActiveTab === 0
                  ? !lightboxState.lightboxName
                  : !selectedLightbox) ||
                selectedProducts.length === 0,
            }}
          />
        }
        headerContent={t('lightbox')}
        isOpen={addToLightboxIsOpen}
        closeCallout={toggleAddToLightboxDrawer}
      >
        <AddToLightbox
          setActiveTab={(tab: number) => {
            setSideDrawerActiveTab(tab)
          }}
          lightboxState={lightboxState}
          updateLightboxState={updateLightboxState}
        />
      </SideDrawer>
    </>
  )
}
