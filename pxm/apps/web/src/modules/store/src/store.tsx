import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import {
  authReducer,
  configReducer,
  featuredFolderReducer,
  lightboxDrawerReducer,
  userReducer,
  variantsReducer,
} from './slices'

// configure which keuy we want to persist
const authPersistConfig = {
  key: 'auth',
  storage: storage,
  whitelist: ['authState'],
}

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  user: userReducer,
  lightbox: lightboxDrawerReducer,
  config: configReducer,
  variants: variantsReducer,
  featuredFolders: featuredFolderReducer,
})

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
