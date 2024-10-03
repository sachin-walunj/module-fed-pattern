'use client'
import { useContext, useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { NewSelect } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import { fetchEditableLightboxesList } from './actions'
import { LightboxContext } from './lightboxContext'
import { LightboxContextType, SelectedLightboxTypes } from './types'

const initialSelectedLightbox: SelectedLightboxTypes = {
  id: '',
  name: '',
  created_by: '',
  created_date: '',
  hostname: '',
  is_publishable_to_channels: false,
  items: [],
  updated_date: '',
  updated_by: '',
  user_id: '',
  read_roles: [],
  write_roles: [],
  item_count: 0,
  shared: false,
}

const AddToExistingLightbox: React.FC = () => {
  const [lightboxList, setLightboxList] = useState<SelectedLightboxTypes[]>([])
  const { selectedLightbox, setSelectedLightbox } = useContext(
    LightboxContext
  ) as LightboxContextType
  const { t } = useTranslate('portal')

  const {
    data: EditableLightboxesList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['fetchEditableLightboxesList'],
    queryFn: () =>
      fetchEditableLightboxesList({
        sort_column: 'updated_date',
        sort_direction: 'desc',
        shared_type: 'edit',
      }),
  })

  useEffect(() => {
    if (EditableLightboxesList?.length) {
      const formattedList = EditableLightboxesList.map(
        (item: SelectedLightboxTypes) => ({
          id: item.id,
          name: item.name,
          read_roles: item.read_roles,
          write_roles: item.write_roles,
        })
      )
      // Update the lightbox list state
      setLightboxList(formattedList)
      // Set the first lightbox as the selected one
      setSelectedLightbox(formattedList[0])
    } else {
      // If no lightboxes are available, reset states
      setLightboxList([])
      setSelectedLightbox(initialSelectedLightbox)
    }
  }, [EditableLightboxesList, setSelectedLightbox])

  function handleChange(value: SelectedLightboxTypes) {
    setSelectedLightbox(value)
  }

  if (isError) return <div>Error: {(error as Error).message}</div>

  return (
    <NewSelect
      labelProps={{
        label: t('searchLightbox'),
      }}
      options={lightboxList}
      optionKeyName='id'
      labelKeyName='name'
      selectedItem={selectedLightbox}
      onChange={handleChange}
      searchBarProps={{ showSearchBar: true }}
      loading={isLoading}
      noOptionsMessage={t('noLightboxesFound')}
      required
    />
  )
}
export default AddToExistingLightbox
