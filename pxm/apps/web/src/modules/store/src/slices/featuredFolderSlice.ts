'use client'
import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

export interface featuredFolderCardTypes {
  activeImageTab: string
  additional_search_tags: string[]
  assets: string[]
  association: string[]
  created_date: string
  db_id: string
  direct_parent: string[]
  display_file: string
  force_child_inherit: []
  has_data: boolean
  has_file: boolean
  hostname: string
  id: string
  image_dominant_color: string
  inherit_parent: boolean
  inherited_parent: string[]
  name: string
  parent_category: string[]
  parent_id: string
  published: boolean
  published_end_date: string
  published_start_date: string
  region: string[]
  region_ids: string[]
  roles: string
  tabs: {
    data_count: number
    id: string
    name: string
    regions: string[]
    roles: string[]
  }
  type: string
  updated_date: string
}

// get FeaturedFolders
export interface featuredFolderResponseTypes {
  hits: {
    sort: string[]
    _id: string
    _index: string
    _score: number
    _source: featuredFolderCardTypes
  }[]
  max_score: number
  total: { value: number; relation: string }
}

const initialState = {}

export const featuredFolderSlice = createSlice({
  name: 'featuredFolder',
  initialState,
  reducers: {
    setFeaturedFolders: (
      state,
      action: PayloadAction<featuredFolderResponseTypes>
    ) => action.payload,
  },
})

export const { setFeaturedFolders } = featuredFolderSlice.actions
export const featuredFolderReducer = featuredFolderSlice.reducer
