import { Attribute, PugTemplate, Tab } from '@amplifi-workspace/store'

export type ItemType = 'unassociated' | 'category' | 'topic' | 'image'
export type BrowseItemType = Exclude<ItemType, 'image'>

export type Collection = Node & {
  assets: string[]
  association: string[] // not sure on this one
  attributes: CollectionAttributes
  db_id: string
  has_data: boolean
  has_file: boolean
  is_super: boolean
  parent_category: string[]
  region: string[]
  tabs: CollectionTab[]
  type: BrowseItemType
  display_file?: string
}

export type Topic = Node & {
  activeImageTab: string
  activeTabId: string
  attributes: Attribute[]
  description: string
  display_file: string
  history_metadata: {
    change_source: string
    table_name: string
    updated_by_user: {
      first_name: string
      last_name: string
      id: string
    }
    updated_date: string
  }
  inherit_parent: boolean
  status: string
  tabs: Tab[]
  updated_date: string
  pug_templates: PugTemplate
  hierarchy: {
    id: string
    name: string
    force_child_inherit: string[] // not sure on this one
  }[]
}

export interface Media {
  id: string
  attributes: CollectionAttributes
  auto_label: string[]
  caption: string
  created_date: string
  db_id: string
  direct_parent: string[]
  enable_tagging: boolean
  file_dimension: string
  file_name: string
  file_path: string
  file_size: number
  format: string
  heroes: string[]
  image_dominant_color: {
    hex: string[]
    ncol: {
      b: [string, string, string]
      h: [string, string, string]
      w: [string, string, string]
    }
  }
  image_ocr: string
  is_converting: boolean
  manual_label: string[]
  metadata: Record<string, unknown>
  parent_category: string[]
  published: boolean
  published_end_date: string | null
  published_start_date: string | null
  region: string[]
  region_ids: string[]
  roles: string[]
  topics: string[]
  transparency: boolean
  type: 'image'
  updated_date: string
  uploaded_date: string
  user_master_file: boolean
  user_id: string
  variants: string[]
  versions_count: number
}

type Node = {
  additional_search_tags: string[]
  additional_title: string
  collection_type: 'parent' | 'variant' | ''
  created_date: string
  direct_parent: string[]
  hostname: string
  id: string
  name: string
  parent_id: string
  parent_topic_id: string
  published: boolean
  published_end_date: string
  published_start_date: string
  region_ids: string[]
  roles: string[]
}

export interface BrowseTreeItem {
  id: string
  name: string
  type: BrowseItemType
  children: BrowseTreeItem[]
  db_id: string
  has_data?: boolean
  parent_id?: string
  parent_category?: string[]
  direct_parent?: string[]
  additional_title?: string
  browse_tree_parent_id?: string
}

interface CollectionAttributes {
  value_boolean: CollectionAttribute<boolean>[]
  value_date: CollectionAttribute<string>[]
  value_list: CollectionAttribute<string[]>[] // not sure on this one
  value_number: CollectionAttribute<number>[]
  value_pick_list: CollectionAttribute<string>[] // not sure on this one
  value_text: CollectionAttribute<string>[]
}

type CollectionAttribute<TValue extends string | boolean | number | string[]> =
  {
    id: string
    label: string
    value: TValue
  }

type CollectionTab = {
  data_count: number
  id: string
  name: string
  regions: string[]
  roles: string[]
}
