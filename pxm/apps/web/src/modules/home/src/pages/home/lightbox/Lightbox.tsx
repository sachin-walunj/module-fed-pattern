import { useContext, useEffect, useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  ButtonGroup,
  FormFooter,
  SideDrawer,
  Tabs,
  TextInput,
  toast,
} from '@patterninc/react-ui'

import {
  AppDispatch,
  RootState,
  updateMyLightboxList,
  updateSharedLightboxList,
  useAppDispatch,
  useAppSelector,
} from '@amplifi-workspace/store'
import { c, useTranslate } from '@amplifi-workspace/web-shared'

import {
  assignSettingsToLightbox,
  createNewLightbox,
  deleteLightbox,
} from './actions'
import EditLightboxSettings from './editLightboxSettings/EditLightboxSettings'
import LightboxCardContainer from './lightboxCardContainer/LightboxCardContainer'
import { LightboxContext } from './lightboxContext'
import { LightboxContextType, SelectedLightboxTypes } from './types'
import { DownloadWithVariants } from '../../../_common/components/DownloadWithVariants'
import {
  FileConfig,
  TypesOfVariants,
} from '../../../_common/types/downloadVariantTypes'
import {
  LightboxState,
  UpdateLightboxStateOptions,
} from '../../../_common/types/lightboxTypes'

import style from './lightbox-footer.module.scss'

const initialLightboxState: LightboxState = {
  lightboxName: '',
  checkedViewItems: [],
  checkedEditItems: [],
}

export function Lightbox() {
  const [activeTab, setActiveTab] = useState(0)
  const { t } = useTranslate('portal')

  return (
    <div>
      <Tabs
        equalWidth
        active={activeTab}
        tabs={[
          {
            content: <LightboxCardContainer />,
            id: 0,
            tabName: t('myLightboxes'),
          },
          {
            content: (
              <LightboxCardContainer
                shared={true}
                setActiveTab={setActiveTab}
              />
            ),
            id: 1,
            tabName: t('sharedLightboxes'),
          },
        ]}
        callout={(tab: number) => {
          setActiveTab(tab)
        }}
      />
    </div>
  )
}

Lightbox.Footer = function LightboxFooter() {
  const user = useAppSelector((state) => state.user)
  const [isOpen, setIsOpen] = useState(false)
  const [isCopyLightboxOpen, setIsCopyLightboxOpen] = useState(false)
  const [lightboxState, setLightboxState] =
    useState<LightboxState>(initialLightboxState)
  // get the selected lightbox from context
  const { selectedLightbox } = useContext(
    LightboxContext
  ) as LightboxContextType
  const lightboxList = useAppSelector((state: RootState) =>
    selectedLightbox?.shared
      ? state.lightbox?.sharedLightboxList
      : state.lightbox?.myLightboxList
  )
  const [isDownloadDrawerOpen, setIsDownloadDrawerOpen] =
    useState<boolean>(false)
  const { user_id, role } = useAppSelector((state: RootState) => state.user)

  const dispatch: AppDispatch = useAppDispatch()

  const queryClient = useQueryClient()
  const { t } = useTranslate('portal')

  const isWriteRolesEmpty =
    (selectedLightbox?.shared &&
      (!selectedLightbox?.write_roles?.length ||
        !selectedLightbox?.write_roles.includes(role))) ??
    false

  useEffect(() => {
    setLightboxState({
      lightboxName: selectedLightbox.name,
      checkedViewItems: selectedLightbox.read_roles,
      checkedEditItems: selectedLightbox.write_roles,
    })
  }, [selectedLightbox])

  const editLightboxSettingsDrawer = () => {
    setIsOpen(!isOpen)
  }

  const HandleCancelEditLightboxSetting = () => {
    setLightboxState({
      lightboxName: selectedLightbox.name,
      checkedViewItems: selectedLightbox.read_roles,
      checkedEditItems: selectedLightbox.write_roles,
    })
    editLightboxSettingsDrawer()
  }

  const HandleEditLightboxSetting = () => {
    if (selectedLightbox !== null) {
      const payload = {
        id: selectedLightbox.id,
        read_roles: lightboxState.checkedViewItems,
        write_roles: lightboxState.checkedEditItems,
      }
      assignSettingsToLightbox(payload)
        .then((response) => {
          const index = lightboxList?.findIndex(
            (lightbox) => lightbox.id === response.id
          )
          if (index !== -1) {
            if (!selectedLightbox.shared) {
              dispatch(updateMyLightboxList({ index, response }))
            } else {
              dispatch(updateSharedLightboxList({ index, response }))
            }
          }
          toast({
            message: t('lightboxSuccessfullyUpdated', {
              name: selectedLightbox.name,
            }),
            type: 'success',
          })
          editLightboxSettingsDrawer()
        })
        .catch((e) => {
          toast({ message: e, type: 'error' })
        })
    }
  }

  const updateLigthboxState = ({
    isName = false,
    lightboxName = '',
    itemsType = 'checkedViewItems',
    roles = [],
    isRolesAdd = false,
    isFlushOut = false,
  }: UpdateLightboxStateOptions) => {
    if (isName) {
      setLightboxState((prevState) => ({
        ...prevState,
        lightboxName: lightboxName,
      }))
    } else if (isFlushOut) {
      setLightboxState((prevState) => ({ ...prevState, [itemsType]: [] }))
    } else if (isRolesAdd) {
      setLightboxState((prevState) => ({
        ...prevState,
        [itemsType]: [...new Set([...prevState[itemsType], ...roles])],
      }))
    } else {
      setLightboxState((prevState) => ({
        ...prevState,
        [itemsType]: prevState[itemsType].filter(
          (item) => !roles.includes(item)
        ),
      }))
    }
  }

  const { mutate: deleteSelectedLightbox, isPending: isDeletingLightbox } =
    useMutation({
      mutationFn: deleteLightbox,
      onMutate: () => {
        toast({
          type: 'info',
          message: t('deletingLightbox'),
        })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['fetchLightboxes'] })
        toast({
          type: 'success',
          message: t('lightboxDeletedSuccessfully'),
        })
      },
      onError: () => {
        toast({
          type: 'error',
          message: t('lightboxDeletionFailed'),
        })
      },
    })

  const handleDeleteLightbox = () => {
    if (selectedLightbox !== null) {
      deleteSelectedLightbox({ id: selectedLightbox.id })
    }
  }

  const toggleCopyLightboxDrawer = () => {
    setIsCopyLightboxOpen(!isCopyLightboxOpen)
  }

  const handleCancelCopyLightbox = () => {
    setLightboxState(initialLightboxState)
    toggleCopyLightboxDrawer()
  }

  const { mutate: copyLightbox } = useMutation({
    mutationFn: createNewLightbox,
    onMutate: () => {
      toast({
        type: 'info',
        message: t('copyingLightbox'),
      })
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['fetchLightboxes'] })
      toast({
        type: 'success',
        message: t('lightboxCreatedSuccessfully', { name: response?.name }),
      })
    },
    onError: () => {
      toast({
        type: 'error',
        message: t('lightboxCopyingFailed'),
      })
    },
  })
  const handleCopyLightbox = () => {
    copyLightbox({
      items: selectedLightbox?.items ?? [],
      name: lightboxState.lightboxName,
      metadata: {
        initiated_by: user_id,
      },
      user_id: user_id,
      read_roles: lightboxState.checkedViewItems,
      write_roles: lightboxState.checkedEditItems,
    })
    toggleCopyLightboxDrawer()
  }

  const downloadVariants = (fileConfig: FileConfig) => {
    const payload = {
      lightbox_id: selectedLightbox.id,
      file_config: fileConfig,
      role: user?.role,
      region: user?.regions.map((region) => region.id),
      wait: false,
    }

    console.log('# Downloading lightbox ', payload)

    // Make the API call here the /file/compress

    setIsDownloadDrawerOpen(false)
  }

  const checkEntityType = (lightBoxData: SelectedLightboxTypes) => {
    if (
      lightBoxData?.items?.some(
        (item) => item.type === 'topic' || item.type === 'category'
      )
    )
      return 'topic'

    return 'file'
  }

  const getVariantList = () => {
    const type = checkEntityType(selectedLightbox)
    const allVariants = ['image', 'video', 'misc', 'document']
    if (type === 'file') {
      const variants = selectedLightbox?.items?.reduce(
        (acc: Array<TypesOfVariants>, { file_type }) => {
          const type = file_type as TypesOfVariants
          if (!acc.includes(type)) {
            acc.push(type)
          }
          return acc
        },
        []
      )
      return variants ?? allVariants
    } else return allVariants
  }

  return (
    <div className={style.lightboxFooter}>
      <ButtonGroup
        buttons={[
          {
            icon: 'download',
            onClick: () => setIsDownloadDrawerOpen(true),
          },
          { icon: 'pin', onClick: () => null },
          { icon: 'rocket', onClick: () => null },
        ]}
        disabled={!selectedLightbox?.id}
      />
      <ButtonGroup
        styleType='primary-blue'
        buttons={[
          {
            actions: [
              {
                callout: () => setIsOpen(!isOpen),
                icon: 'pencil',
                text: t('viewEditSettings'),
                disabled: {
                  value: isWriteRolesEmpty,
                },
              },
              {
                icon: 'document',
                text: t('makeACopy'),
                callout: () => {
                  updateLigthboxState({
                    isName: true,
                    lightboxName: lightboxState.lightboxName + ' - Copy',
                  })
                  setIsCopyLightboxOpen(!isCopyLightboxOpen)
                },
              },
              {
                confirmation: {
                  body: t('areYouSureYouWantToDeleteLightbox', {
                    name: selectedLightbox?.name,
                  }),
                  confirmCallout: () => handleDeleteLightbox(),
                  header: c('confirmDelete'),
                  type: 'red',
                },
                destructive: true,
                hasDivider: true,
                icon: 'trash',
                text: isDeletingLightbox ? c('deleting') : c('delete'),
                disabled: {
                  value: isWriteRolesEmpty || isDeletingLightbox,
                },
              },
            ],
            placement: 'top',
          },
          { children: t('shareLightbox'), onClick: () => null },
        ]}
        disabled={!selectedLightbox?.id}
      />
      <SideDrawer
        footerContent={
          <FormFooter
            cancelButtonProps={{ onClick: HandleCancelEditLightboxSetting }}
            saveButtonProps={{
              children: c('save'),
              onClick: HandleEditLightboxSetting,
            }}
          />
        }
        layerPosition={2}
        headerContent={t('editLightboxSettings')}
        isOpen={isOpen}
        closeCallout={editLightboxSettingsDrawer}
      >
        <EditLightboxSettings
          updateLigthboxState={updateLigthboxState}
          lightboxState={lightboxState}
        />
      </SideDrawer>
      <SideDrawer
        footerContent={
          <FormFooter
            cancelButtonProps={{ onClick: handleCancelCopyLightbox }}
            saveButtonProps={{
              children: c('save'),
              onClick: handleCopyLightbox,
            }}
          />
        }
        layerPosition={2}
        headerContent={t('copyLightbox')}
        isOpen={isCopyLightboxOpen}
        closeCallout={toggleCopyLightboxDrawer}
      >
        <TextInput
          callout={(_, value) => {
            updateLigthboxState({
              isName: true,
              lightboxName: value.toString(),
            })
          }}
          debounce={1000}
          id='newLightboxName'
          labelText={t('lightboxName')}
          type='text'
          value={lightboxState.lightboxName}
          required
        />
      </SideDrawer>
      <DownloadWithVariants
        isOpen={isDownloadDrawerOpen}
        onClose={() => setIsDownloadDrawerOpen(false)}
        onDownload={(file_config: FileConfig) => downloadVariants(file_config)}
        variantsList={getVariantList() as TypesOfVariants[]}
      />
    </div>
  )
}

export default Lightbox
