export type LightboxItemsType = {
  id: string
  name: string
  display_file: string
  file_type: string
  type: string
  image_url?: string
}[]

export type SelectedLightboxTypes = {
  id: string
  name: string
  created_by?: string
  created_date?: string
  hostname?: string
  is_publishable_to_channels?: boolean
  items?: LightboxItemsType
  updated_date?: string
  updated_by?: string
  user_id?: string
  read_roles: string[]
  write_roles: string[]
  item_count?: number
  shared?: boolean
}

export type LightboxContextType = {
  selectedLightbox: SelectedLightboxTypes
  setSelectedLightbox: React.Dispatch<
    React.SetStateAction<{
      id: string
      name: string
      created_date?: string
      hostname?: string
      is_publishable_to_channels?: boolean
      items?: LightboxItemsType
      updated_date?: string
      updated_by?: string
      user_id?: string
      read_roles: string[]
      write_roles: string[]
    }>
  >
}
