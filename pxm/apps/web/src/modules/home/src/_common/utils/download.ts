import { useMutation } from '@tanstack/react-query'

import { toast } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import { downloadFile } from '../server/actions'

export const GenerateDownload = () => {
  const { t } = useTranslate('portal')

  const { mutate: downloadFiles } = useMutation({
    mutationFn: downloadFile,
    onMutate: () =>
      toast({
        type: 'info',
        message: 'Collecting files for your download ...',
      }),
    onSuccess: (data) => {
      if (data?.download_link) {
        const link = document.createElement('a') // Creating an anchor element
        link.href = data.download_link // Attaching the link
        document.body.appendChild(link) // Adding the element to the DOM
        link.click() // Triggering the download
        document.body.removeChild(link) // Cleaning up the DOM
      } else if (data.message) {
        toast({
          type: 'info',
          message: t('downloadEmailNotification'),
        })
      }
    },
    onError: () =>
      toast({
        type: 'error',
        message: t('somethingWentWrong'),
      }),
  })

  return downloadFiles
}
