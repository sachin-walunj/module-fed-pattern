'use client'

import { toast } from '@patterninc/react-ui'

export const errorToast = (message: string) =>
  toast({ type: 'error', message, config: { autoClose: 5000 } })
