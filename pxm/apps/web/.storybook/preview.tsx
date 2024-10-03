import { Preview } from '@storybook/react'

import React from 'react'

import { PatternToastContainer } from '@patterninc/react-ui'

import { StoreProvider } from '../src/lib/StoreProvider'

import './storybook-styles.scss'

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        order: ['General', 'Components', 'Functions', 'Hooks', '*'],
        method: 'numerical',
      },
    },
  },
  decorators: [
    (Story) => {
      const isClient = typeof window !== 'undefined'
      const searchParam = isClient ? window.location.search : '',
        match = searchParam.match(/[?&]viewMode=([^&]+)/),
        viewMode = match?.[1]

      return (
        <StoreProvider
          sessionData={{
            first_name: '',
            last_name: '',
            email: '',
            active: true,
            authenticated: true,
            ci_session: '',
            language: '',
            role: '',
            user_id: '',
            uid: '',
            regions: [],
            lightboxes: [],
          }}
          configData={{}}
        >
          <Story />
          {viewMode === 'story' ? <PatternToastContainer /> : null}
        </StoreProvider>
      )
    },
  ],
}

export default preview
