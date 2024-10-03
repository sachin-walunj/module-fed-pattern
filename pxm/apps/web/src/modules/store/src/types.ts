export interface PugTemplate {
  fields: Field[]
  ids?: string[]
  pdfsheet: boolean
  pdfsheet_visibility_control: Visibility
}

export type SubField = {
  collection_count: number
  file_count: number
  group_id: string[]
  id: string
  is_associated: boolean
  is_file_filter: boolean
  is_topic_filter: boolean
  label: string
  language_code?: string
  maximum: number
  minimum: number
  options: string[]
  permissions?: string[]
  region_ids: string[]
  roles: string[]
  show_label?: boolean
  type?: string
  value: string
  value_type: string
}

export type Field = {
  background: string
  description_fields_length: number
  fields: SubField[]
  id: string
  image_stack_group_id?: string
  main_fields_length: number
  name: string
  regions: string[]
  split_label?: boolean
  visibility: Record<string, boolean>
}

type BooleanValues = {
  value_type: 'Boolean'
  value: boolean
}

type TextNumberValues = {
  value_type: 'Text' | 'Number'
  value: string
}

type DateValues = {
  value_type: 'Date'
  value: string
}

type BaseObjectValue = {
  id: string
  label: string
}

type BooleanObjectValue = BaseObjectValue & BooleanValues

type TextNumberObjectValue = BaseObjectValue & TextNumberValues

type DateObjectValue = BaseObjectValue & DateValues

export type ObjectValue =
  | BooleanObjectValue
  | TextNumberObjectValue
  | DateObjectValue

type ListValues = {
  value_type: 'List'
  value: ObjectValue[]
}

type PickListValues = {
  value_type: 'Pick List'
  value: string[]
}

export interface RawOption {
  id: string
  label: string
  value_type: 'Boolean' | 'Text' | 'Number' | 'Date'
}

export type Attribute = {
  // there are different properties that show up, not sure what determines that
  collection_count?: number
  file_count?: number
  group_id: string[]
  hostname?: string
  id: string
  is_associated?: boolean
  is_file_filter?: boolean
  is_topic_filter?: boolean
  label: string
  language_code: string
  locked?: boolean
  maximum?: number
  minimum?: number
  options: RawOption[]
  permissions?: string[]
  region_ids: string[]
  roles: string[]
} & (
  | BooleanValues
  | TextNumberValues
  | DateValues
  | ListValues
  | PickListValues
)

export type Tab = {
  attribute_settings?: Record<string, boolean>
  attributes?: Attribute[]
  count?: number
  custom: boolean
  default_sorting?: Record<string, string>
  hero_preview_attribute?: string
  id: string
  menus: Menu[]
  name: string
  region_ids: string[]
  roles: string[]
  type: string
}

export type Menu = {
  name: string
  order?: number
  id?: string
  children?: string[]
}

export interface Visibility {
  admin: boolean
  anonymous: boolean
  contributor: boolean
  gpuser: boolean
  guser: boolean
  superadmin: boolean
}

export interface RoleVisibility {
  allow_asset_download: string[]
  empty_category: string[]
  empty_category_hierarchy: string[]
  empty_category_result: string[]
  empty_tabs: string[]
  empty_topic: string[]
}

export interface variantsType {
  image: {
    dim: string | number
    ext: string
    size: string
  }[]
  video: {
    dim: string | number
    ext: string
    size: string
  }[]
}
