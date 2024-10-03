import { TranslationProvider } from '@patterninc/react-ui'

import { i18nPXMInstance, initPXMI18nInstance } from './TranslationService'

export function PXMTranslationProvider({ children }: { children: any }) {
  initPXMI18nInstance()

  return (
    <TranslationProvider i18nInstance={i18nPXMInstance}>
      {children}
    </TranslationProvider>
  )
}
