export type ItemsType = 'checkedViewItems' | 'checkedEditItems'
export type LightboxState = {
  lightboxName: string
  checkedViewItems: string[]
  checkedEditItems: string[]
}
export type UpdateLightboxStateOptions = {
  isName?: boolean
  lightboxName?: string
  itemsType?: ItemsType
  roles?: string[]
  isRolesAdd?: boolean
  isFlushOut?: boolean
}
export type CreateNewLightboxProps = {
  updateLigthboxState: ({
    isName,
    lightboxName,
    itemsType,
    roles,
    isRolesAdd,
    isFlushOut,
  }: UpdateLightboxStateOptions) => void
  lightboxState: LightboxState
}
export type EditLightboxSettingsProps = {
  updateLigthboxState: ({
    isName,
    lightboxName,
    itemsType,
    roles,
    isRolesAdd,
    isFlushOut,
  }: UpdateLightboxStateOptions) => void
  lightboxState: LightboxState
}
