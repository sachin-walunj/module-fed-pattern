'use client'
import { createSlice } from '@reduxjs/toolkit'

import { variantsType } from '../types'

import type { PayloadAction } from '@reduxjs/toolkit'

const initialState: variantsType = {
  image: [
    {
      dim: '',
      ext: '',
      size: '',
    },
  ],
  video: [
    {
      dim: '',
      ext: '',
      size: '',
    },
  ],
}

export const variantsToDownload = createSlice({
  name: 'variants',
  initialState,
  reducers: {
    setVariants: (state, action: PayloadAction<variantsType>) => action.payload,
  },
})

export const { setVariants } = variantsToDownload.actions
export const variantsReducer = variantsToDownload.reducer
