'use client'

import { SetStateAction, useCallback, useReducer, useState } from 'react'

import { FormFooter, Picker, SideDrawer } from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { FileProgressDisplayProps, FileSelection } from './FileSelection'
import { UploadSettings } from './UploadSettings'
import { BrowseTreeItem } from '../../../../_common/types/collectionTypes'

export type FolderOption = {
  name: string
  db_id: string
}

type FileUploadForm = {
  enableTagging: boolean
  tags: string[]
  mainFolder: BrowseTreeItem | null
  additionalFolders: BrowseTreeItem[]
}

type FileUploadDrawerProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  numUploadsInProgress: number
  setNumUploadsInProgress: React.Dispatch<React.SetStateAction<number>>
  numUploadsComplete: number
  setNumUploadsComplete: React.Dispatch<React.SetStateAction<number>>
}

export function FileUploadDrawer({
  isOpen,
  setIsOpen,
  numUploadsInProgress,
  setNumUploadsInProgress,
  numUploadsComplete,
  setNumUploadsComplete,
}: FileUploadDrawerProps) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [fileUploadForm, setFileUploadForm] = useReducer(
    (state: FileUploadForm, action: Partial<FileUploadForm>) => {
      return { ...state, ...action }
    },
    {
      enableTagging: true,
      tags: [],
      mainFolder: null,
      additionalFolders: [],
    }
  )
  const [uploads, setUploads] = useState<FileProgressDisplayProps[]>([])
  const filesCallout = useCallback(
    (files: File[]) => {
      setUploads(
        files.map((file) => ({
          name: file.name,
          percentage: 0,
          status: 'uploading',
        }))
      )
    },
    [setUploads]
  )
  const cancelCallout = useCallback((name: string) => {
    setUploads((uploads) => uploads.filter((upload) => upload.name !== name))
  }, [])

  const { t } = useTranslate('portal')
  return (
    <SideDrawer
      isOpen={isOpen}
      closeCallout={() => {
        setIsOpen(false)
        setCurrentStep(1)
      }}
      headerContent='Upload/Import'
      stepperProps={{
        steps: [t('uploadSettings'), t('fileSelection')],
        currentStep: currentStep,
        callout: (step) => {
          setCurrentStep(step - 1)
        },
      }}
      footerContent={
        <FormFooter
          cancelButtonProps={{
            onClick: () => setIsOpen(false),
          }}
          saveButtonProps={{
            onClick: () => {
              if (currentStep > 1) {
                // TODO: save the data
                setCurrentStep(1)
                setIsOpen(false)
              } else {
                setCurrentStep(currentStep + 1)
              }
            },
            styleType: 'primary-blue',
            children: currentStep === 1 ? c('next') : c('save'),
          }}
        />
      }
    >
      {currentStep === 1 && (
        <>
          <Picker
            options={[
              { id: 1, text: t('fileUpload'), value: 'file_upload' },
              { id: 2, text: t('dataImport'), value: 'data_import' },
            ]}
            selected='file_upload'
            callout={() => {
              // TODO: Handle data import switch
            }}
            disabled
          />
          <UploadSettings
            tags={fileUploadForm.tags}
            setTags={(value: SetStateAction<string[]>) => {
              setFileUploadForm({
                tags:
                  value instanceof Function
                    ? value(fileUploadForm.tags)
                    : value,
              })
            }}
            mainFolder={fileUploadForm.mainFolder}
            setMainFolder={(value: SetStateAction<BrowseTreeItem | null>) => {
              setFileUploadForm({
                mainFolder:
                  value instanceof Function
                    ? value(fileUploadForm.mainFolder)
                    : value,
              })
            }}
            additionalFolders={fileUploadForm.additionalFolders}
            setAdditionalFolders={(value: SetStateAction<BrowseTreeItem[]>) => {
              setFileUploadForm({
                additionalFolders:
                  value instanceof Function
                    ? value(fileUploadForm.additionalFolders)
                    : value,
              })
            }}
            enableTagging={fileUploadForm.enableTagging}
            setEnableTagging={(value: SetStateAction<boolean>) => {
              setFileUploadForm({
                enableTagging:
                  value instanceof Function
                    ? value(fileUploadForm.enableTagging)
                    : value,
              })
            }}
          />
        </>
      )}
      {currentStep === 2 && (
        <FileSelection
          uploads={uploads}
          filesCallout={filesCallout}
          numUploadsInProgress={numUploadsInProgress}
          setNumUploadsInProgress={setNumUploadsInProgress}
          numUploadsComplete={numUploadsComplete}
          setNumUploadsComplete={setNumUploadsComplete}
        />
      )}
    </SideDrawer>
  )
}
