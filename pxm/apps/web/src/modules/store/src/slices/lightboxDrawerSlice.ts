'use client'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type LightboxList = {
  created_by: string
  created_date: string
  id: string
  item_count: number
  name: string
  read_roles: string[]
  write_roles: string[]
}
export type SelectedProduct = {
  id: string
  name: string
  type: string
}
export interface LightboxDrawerState {
  lightboxIsOpen: boolean
  AddToLightboxIsOpen: boolean
  myLightboxList: LightboxList[]
  sharedLightboxList: LightboxList[]
  selectedProducts: SelectedProduct[]
}

const initialState: LightboxDrawerState = {
  lightboxIsOpen: false,
  AddToLightboxIsOpen: false,
  myLightboxList: [],
  sharedLightboxList: [],
  selectedProducts: [],
}

export const lightboxDrawerSlice = createSlice({
  name: 'lightbox',
  initialState,
  reducers: {
    toggleLightboxDrawer: (
      state,
      action: PayloadAction<{ parent: string; selectedProducts?: any[] }>
    ) => {
      if (action.payload.parent === 'lightbox') {
        state.lightboxIsOpen = !state.lightboxIsOpen
      }
      if (action.payload.parent === 'AddToLightbox') {
        state.AddToLightboxIsOpen = !state.AddToLightboxIsOpen
      }
    },
    setMyLightboxList: (state, action) => {
      state.myLightboxList = action.payload
    },
    setSharedLightboxList: (state, action) => {
      state.sharedLightboxList = action.payload
    },
    setSelectedProducts: (state, action: PayloadAction<SelectedProduct[]>) => {
      state.selectedProducts = action.payload
    },
    updateMyLightboxList: (state, action) => {
      const { index, response } = action.payload

      if (index >= 0 && index < state.myLightboxList.length) {
        state.myLightboxList[index] = {
          ...state.myLightboxList[index],
          read_roles:
            response.read_roles || state.myLightboxList[index].read_roles,
          write_roles:
            response.write_roles || state.myLightboxList[index].write_roles,
        }
      }
    },
    updateSharedLightboxList: (state, action) => {
      const { index, response } = action.payload

      if (index >= 0 && index < state.sharedLightboxList.length) {
        state.sharedLightboxList[index] = {
          ...state.sharedLightboxList[index],
          read_roles:
            response.read_roles || state.sharedLightboxList[index].read_roles,
          write_roles:
            response.write_roles || state.sharedLightboxList[index].write_roles,
        }
      }
    },
  },
})

export const {
  toggleLightboxDrawer,
  setMyLightboxList,
  setSharedLightboxList,
  setSelectedProducts,
  updateMyLightboxList,
  updateSharedLightboxList,
} = lightboxDrawerSlice.actions
export const lightboxDrawerReducer = lightboxDrawerSlice.reducer
