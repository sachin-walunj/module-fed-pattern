'use client'

import { useCallback, useEffect, useMemo } from 'react'

import {
  FileUploader,
  FormLabel,
  Icon,
  ProgressBar,
} from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

export type FileProgressDisplayProps = {
  name: string
  percentage: number
  status: 'uploading' | 'complete' | 'error'
}

type FileSelectionProps = {
  filesCallout: (files: File[]) => void
  uploads: FileProgressDisplayProps[]
  numUploadsInProgress: number
  setNumUploadsInProgress: React.Dispatch<React.SetStateAction<number>>
  numUploadsComplete: number
  setNumUploadsComplete: React.Dispatch<React.SetStateAction<number>>
}

export function FileSelection({
  filesCallout,
  uploads,
  numUploadsInProgress,
  setNumUploadsInProgress,
  numUploadsComplete,
  setNumUploadsComplete,
}: FileSelectionProps) {
  const { t } = useTranslate('portal')
  const uploadInProgress = useMemo(() => {
    return uploads.some((upload) => upload.status === 'uploading')
  }, [uploads])
  const onSelected = useCallback(
    (files: File[]) => {
      filesCallout(files)
      setNumUploadsInProgress(files.length)
    },
    [filesCallout]
  )

  useEffect(() => {
    const numComplete = uploads.filter(
      (upload) => upload.status !== 'uploading'
    ).length
    setNumUploadsComplete(numComplete)
    setNumUploadsInProgress(uploads.length)
  }, [uploads])
  return (
    <>
      <FormLabel
        label={t('fileUpload')}
        rightLabel={
          numUploadsComplete !== numUploadsInProgress
            ? `${numUploadsComplete}/${numUploadsInProgress} ${t(
                'complete'
              ).toUpperCase()}`
            : ''
        }
      />
      {uploadInProgress && (
        <div className='pb-8'>
          <ProgressBar percentage={75} />
        </div>
      )}
      <div className='bdrr-4 bdr bdrc-medium-purple p-16'>
        <FileUploader acceptMultiple uploadCallout={onSelected} />
        {uploads.length > 0 && (
          <div className='flex flex-direction-column gap-8 pt-8'>
            {uploads.map((upload, index) => (
              <FileProgressDisplay
                {...upload}
                key={`${upload.name}-${index}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function FileProgressDisplay({
  name,
  percentage,
  status,
}: FileProgressDisplayProps) {
  const { t } = useTranslate('portal')
  return (
    <div className='flex justify-content-between align-items-center fs-12'>
      <span>{name}</span>
      <div>
        {status === 'uploading' && (
          <div className='fs-12 flex gap-8'>
            <ProgressBar percentage={percentage} />
          </div>
        )}
        {status === 'complete' && (
          <div className='fc-dark-green flex gap-8'>
            <Icon icon='check' customClass='svg-dark-green' size='12px' />
            <span>{t('uploadComplete')}</span>
          </div>
        )}
        {status === 'error' && (
          <div className='fc-dark-red flex gap-8'>
            <Icon icon='errorWarning' customClass='svg-dark-red' size='12px' />
            <span>{t('uploadFailed')}</span>
          </div>
        )}
      </div>
    </div>
  )
}
