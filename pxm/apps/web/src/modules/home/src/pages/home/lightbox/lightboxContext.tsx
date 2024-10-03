import { createContext, useState } from 'react'

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

export const LightboxContext = createContext<LightboxContextType | null>({
  selectedLightbox: initialSelectedLightbox,
  setSelectedLightbox: () => null,
})

export const LightboxProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedLightbox, setSelectedLightbox] =
    useState<SelectedLightboxTypes>({
      id: '',
      name: '',
      created_date: '',
      hostname: '',
      is_publishable_to_channels: false,
      items: [],
      updated_date: '',
      updated_by: '',
      user_id: '',
      read_roles: [],
      write_roles: [],
    })

  const providerValue = {
    selectedLightbox: selectedLightbox,
    setSelectedLightbox: setSelectedLightbox,
  }

  return (
    <LightboxContext.Provider value={providerValue}>
      {children}
    </LightboxContext.Provider>
  )
}
