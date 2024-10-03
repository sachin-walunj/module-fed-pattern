'use client'
import { createSlice } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'

export interface IUserState {
  first_name: string
  last_name: string
  email: string
  active: boolean
  authenticated: boolean
  ci_session: string
  language: string
  role: string
  user_id: string
  uid: string
  regions: {
    active: boolean
    id: string
    is_primary: boolean
    name: string
    rethinkdb_id: string
  }[]
  v3_enabled?: boolean
}

const initialState: IUserState = {
  first_name: '',
  last_name: '',
  email: '',
  active: false,
  authenticated: false,
  ci_session: '',
  language: '',
  role: '',
  user_id: '',
  uid: '',
  regions: [],
  v3_enabled: false,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUserState>) => action.payload,
  },
})

export const { setUser } = userSlice.actions
export const userReducer = userSlice.reducer
