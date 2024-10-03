'use client'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import { useMutation, useQuery } from '@tanstack/react-query'
import Sortable from 'sortablejs'

import {
  Button,
  FormFooter,
  ListLoading,
  NewSelect,
  SideDrawer,
  toast,
} from '@patterninc/react-ui'

import {
  AppDispatch,
  RootState,
  setMyLightboxList,
  setSharedLightboxList,
  useAppDispatch,
  useAppSelector,
} from '@amplifi-workspace/store'
import { DragAndDropWrapper, useTranslate } from '@amplifi-workspace/web-shared'

import {
  LightboxState,
  UpdateLightboxStateOptions,
} from '../../../../_common/types/lightboxTypes'
import {
  createNewLightbox,
  createNewLightboxPayload,
  fetchLightbox,
  fetchLightboxItems,
  reorderLightboxItems,
} from '../actions'
import CreateNewLightbox from '../createNewLightbox/CreateNewLightbox'
import { LightboxContext } from '../lightboxContext'
import LightboxProductCard from '../lightboxProductCard/LightboxProductCard'
import { LightboxContextType, SelectedLightboxTypes } from '../types'

import style from './lightbox-card-container.module.scss'

interface LightboxProductCardType {
  id: string
  name: string
  imageUrl?: string
  file_type: string
  display_file: string
  type: string
  onClick?: () => void
}

const initialLightboxState: LightboxState = {
  lightboxName: '',
  checkedViewItems: [],
  checkedEditItems: [],
}

const LightboxCardContainer = ({
  shared = false,
  setActiveTab,
}: {
  shared?: boolean
  setActiveTab?: React.Dispatch<React.SetStateAction<number>>
}): JSX.Element => {
  // state to open/close drawer
  const [isOpen, setIsOpen] = useState(false)
  // state to manage lightbox state
  const [lightboxState, setLightboxState] =
    useState<LightboxState>(initialLightboxState)
  // get user id from store
  const userId = useAppSelector((state: RootState) => state.user?.user_id)
  // get all lightbox list from store
  const lightboxList = useAppSelector((state: RootState) =>
    shared ? state.lightbox.sharedLightboxList : state.lightbox.myLightboxList
  )
  // set / get selected lightbox
  const { selectedLightbox, setSelectedLightbox } = useContext(
    LightboxContext
  ) as LightboxContextType
  // set lightbox items to load cards for selected lightbox
  const [lightboxItems, setLightboxItems] = useState<LightboxProductCardType[]>(
    []
  )
  const { t } = useTranslate('portal')

  useEffect(() => {
    setSelectedLightbox(selectedLightbox)
  }, [selectedLightbox, setSelectedLightbox])
  // get dispatch from store
  const dispatch: AppDispatch = useAppDispatch()
  // Created ref for products. This will be used to update products on drag and drop.
  const products = useRef<LightboxProductCardType[]>(lightboxItems)

  const updateLigthboxState = ({
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

  const toggleNewLightboxDrawer = () => {
    setIsOpen(!isOpen)
  }

  const HandleSubmitNewLightbox = () => {
    if (lightboxState.lightboxName !== '') {
      const payload: createNewLightboxPayload = {
        items: [],
        metadata: { initiated_by: userId },
        name: lightboxState.lightboxName,
        read_roles: lightboxState.checkedViewItems,
        write_roles: lightboxState.checkedEditItems,
      }
      createNewLightboxMutation(payload)
    }
  }

  // Create New Lightbox
  const { mutate: createNewLightboxMutation, isPending: isCreatingLightbox } =
    useMutation({
      mutationFn: createNewLightbox,
      onMutate: () => {
        toast({
          type: 'info',
          message: t('creatingLightbox'),
        })
      },
      onSuccess: (response) => {
        const selectedData = {
          id: response.id,
          name: response.name,
          read_roles: response.read_roles,
          write_roles: response.write_roles,
        }
        refetchLightboxList()
        toggleNewLightboxDrawer()
        setSelectedLightbox(selectedData)
        setLightboxState(initialLightboxState)
        setActiveTab?.(0)
        toast({
          type: 'success',
          message: t('lightboxCreatedSuccessfully', { name: response?.name }),
        })
      },
      onError: (error) => {
        toast({
          type: 'error',
          message: t('lightboxNameAlreadyExists'),
        })
      },
    })

  const HandleCancelNewLightbox = () => {
    setLightboxState(initialLightboxState)
    toggleNewLightboxDrawer()
  }
  // handle change event for lightbox selection
  function handleChange(value: SelectedLightboxTypes) {
    setSelectedLightbox(value)
  }

  // fetch shared lightbox list on changing shared state
  const { data: lightboxesData, refetch: refetchLightboxList } = useQuery({
    queryKey: ['fetchLightboxes', shared],
    queryFn: async () =>
      await fetchLightbox({
        id: 'list',
        shared: shared,
        user_id: userId,
        sort_column: 'updated_date',
        sort_direction: 'desc',
      }),
    refetchInterval: 300000, // refetch every 5 mins
  })

  // set lightbox list in store on changing lightbox list
  useEffect(() => {
    if (lightboxesData) {
      shared
        ? dispatch(setSharedLightboxList(lightboxesData))
        : dispatch(setMyLightboxList(lightboxesData))
    }
  }, [lightboxesData, shared, dispatch])

  useEffect(() => {
    // set first lightbox as selected lightbox when selected lightbox is not in the list
    lightboxList.every((item) => item.id !== selectedLightbox?.id) &&
      setSelectedLightbox(lightboxList[0] || { id: '', name: '' })
  }, [shared, lightboxList, setSelectedLightbox, selectedLightbox?.id])

  // fetch lightbox items on changing selected lightbox
  const { data: itemsData, isLoading: isItemsLoading } = useQuery({
    queryKey: ['fetchLightboxItems', selectedLightbox?.id],
    queryFn: async () =>
      await fetchLightboxItems({
        id: selectedLightbox?.id,
      }),
    select: useCallback(
      (data: { items: LightboxProductCardType[] }) => {
        setSelectedLightbox((prevState) => {
          return {
            ...prevState,
            items: data?.items,
          }
        })
        return data?.items
      },
      [setSelectedLightbox]
    ),
    refetchInterval: 10000, // refetch every 10 seconds
    enabled: !!selectedLightbox?.id,
  })

  useEffect(() => {
    // Update Lightbox Items
    if (itemsData) {
      setLightboxItems(itemsData)
      products.current = itemsData
    } else {
      setLightboxItems([])
      products.current = []
    }
  }, [itemsData, selectedLightbox])

  // API query to update lightbox items order
  const { mutate: updateLightboxItemsOrder } = useMutation({
    mutationFn: reorderLightboxItems,
    onSuccess: () => {
      toast({
        type: 'success',
        message: t('orderOfLightboxItemsSuccessfullyChanged'),
      })
    },
    onError: () => {
      toast({
        type: 'error',
        message: t('orderOfLightboxItemsIsNotChanged'),
      })
    },
  })

  // Update Items order on drag and drop
  const handleDragEnd = useCallback(
    (event: Sortable.SortableEvent) => {
      updateLightboxItemsOrder({
        id: selectedLightbox?.id,
        name: selectedLightbox?.name,
        items: products.current,
        metadata: {
          initiated_by: userId,
        },
      })
    },
    [
      selectedLightbox?.id,
      selectedLightbox?.name,
      updateLightboxItemsOrder,
      userId,
    ]
  )

  return (
    <div>
      <div className={style.cardContainer}>
        <div className={style.selectContainer}>
          <NewSelect
            searchBarProps={{
              showSearchBar: true,
            }}
            options={lightboxList.map((item: SelectedLightboxTypes) => {
              return {
                ...item,
                id: item.id,
                name: item.name,
                read_roles: item.read_roles,
                write_roles: item.write_roles,
              }
            })}
            onChange={(value) => handleChange(value)}
            optionKeyName='name'
            labelKeyName='name'
            selectedItem={selectedLightbox}
          />
        </div>
        <Button
          onClick={toggleNewLightboxDrawer}
          className={style.newLightboxButton}
        >
          {t('newLightbox')}
        </Button>
        <SideDrawer
          footerContent={
            <FormFooter
              cancelButtonProps={{ onClick: HandleCancelNewLightbox }}
              saveButtonProps={{
                children: t('createNewLightbox'),
                onClick: HandleSubmitNewLightbox,
                disabled: isCreatingLightbox || !lightboxState.lightboxName,
              }}
            />
          }
          layerPosition={2}
          headerContent={t('createNewLightbox')}
          isOpen={isOpen}
          closeCallout={toggleNewLightboxDrawer}
        >
          <CreateNewLightbox
            updateLigthboxState={updateLigthboxState}
            lightboxState={lightboxState}
          />
        </SideDrawer>
      </div>
      {isItemsLoading ? (
        <ListLoading />
      ) : products.current.length === 0 ? (
        <div className='mt-72 text-center'>
          <div className='fs-16 fw-bold fc-dark-purple'>
            {t('noItemsFound')}
          </div>
          <div className='fs-12 fc-purple'>
            {t('weCouldNotFindAnyDataForTheSelectedLightbox')}
          </div>
        </div>
      ) : (
        <div className={style.productCardContainer}>
          <DragAndDropWrapper
            multiDrag={true}
            filteredClass='filtered'
            draggableClass='draggableArea'
            dataIdAttr='id'
            items={products}
            onEnd={handleDragEnd}
          >
            {products?.current.map((product) => (
              <LightboxProductCard
                key={product.id}
                {...product}
                customClassName='draggableArea'
              />
            ))}
          </DragAndDropWrapper>
        </div>
      )}
    </div>
  )
}

export default LightboxCardContainer
