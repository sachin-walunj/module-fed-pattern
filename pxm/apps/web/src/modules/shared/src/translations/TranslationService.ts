import {
  newTranslationInstance,
  tr,
  useTranslation,
} from '@patterninc/react-ui'

import { NS, RESOURCES } from './resources'

export const LOCAL_STORAGE_LANGUAGE_SETTING_KEY = 'language_setting'

/** i18n instance for PXM */
export const i18nPXMInstance = newTranslationInstance(RESOURCES)

export const initPXMI18nInstance = () => {
  const isDebugMode = localStorage.getItem('debug-translations') === 'true'
  i18nPXMInstance.init()
  i18nPXMInstance.changeLanguage(
    isDebugMode ? 'cimode' : getLocalStorageLanguageTag()
  )
}

export type TranslationNamespace = keyof typeof NS
export type TranslationKey = `${TranslationNamespace}:${string}`

/**
 * Translation helper function. Alternative the useTranslate hook in places where hooks aren't easily available (outside of components)
 * @param key - namespace:key of the translation (in the format 'namespace:key')
 * @param values - (optional) values to be interpolated into the translated string
 * @returns translated string
 **/
export const t = (
  namespaceAndKey: TranslationKey,
  values?: Record<string, unknown>
) => tr(namespaceAndKey, i18nPXMInstance, values)

/**
 * Translation helper function, shorthand for using the "common" namespace `t('common:key')`
 * @param key - key of the translation
 * @param values - (optional) values to be interpolated into the translated string
 * @returns translated string
 **/
export const c = (key: string, values?: Record<string, unknown>) =>
  t(`common:${key}`, values)

export const useTranslate = (namespace: TranslationNamespace) =>
  useTranslation(namespace)

/** Defaults to english (en) if value not found in localStorage */
export const getLocalStorageLanguageTag = () => {
  const languageSetting = localStorage.getItem(
    LOCAL_STORAGE_LANGUAGE_SETTING_KEY
  )
  return languageSetting ?? 'en'
}

export type LanguageOption = {
  value: string
  label: string
  name: string
}
export const languageOptions: LanguageOption[] = [
  { value: 'en', label: 'English', name: 'English' },
  { value: 'zh', label: 'Chinese', name: 'Chinese' },
]
