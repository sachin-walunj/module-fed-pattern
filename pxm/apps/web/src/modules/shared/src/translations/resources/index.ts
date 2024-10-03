import EN_COMMON from './common/en.common.json'
import ZH_COMMON from './common/zh.common.json'
import EN_PORTAL from './portal/en.portal.json'
import ZH_PORTAL from './portal/zh.portal.json'
import EN_SETTINGS from './settings/en.settings.json'
import ZH_SETTINGS from './settings/zh.settings.json'
import { TranslationNamespace } from '../TranslationService'

export const NS = {
  common: 'common',
  portal: 'portal',
  settings: 'settings',
} as const

export const RESOURCES: Record<
  string,
  Record<TranslationNamespace, Record<string, string>>
> = {
  en: {
    common: EN_COMMON,
    portal: EN_PORTAL,
    settings: EN_SETTINGS,
  },
  zh: {
    common: ZH_COMMON,
    portal: ZH_PORTAL,
    settings: ZH_SETTINGS,
  },
} as const
