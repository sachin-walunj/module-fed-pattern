'use client'

import { useState } from 'react'

import Image from 'next/image'

import {
  EmptyState,
  FileUploader,
  FormFooter,
  Icon,
  SideDrawer,
} from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import { updateBrand } from '../../actions'
import { DetailCard } from '../detailCard/DetailCard'

export function StyleGuide({
  styleGuide,
  id,
  preview,
}: {
  styleGuide?: File
  id: string
  preview?: string
}) {
  const { t } = useTranslate('settings')
  const [PDFDrawerOpen, setPDFDrawerOpen] = useState(false)
  const [file, setFile] = useState<File | undefined>(styleGuide)

  return (
    <DetailCard
      title={t('styleGuide')}
      isEdit={!PDFDrawerOpen && !!file}
      editCallout={() => setPDFDrawerOpen(true)}
    >
      {file ? (
        <div style={{ position: 'relative' }}>
          {/* TODO: figure out backup image */}
          <Image src={preview || ''} alt={t('styleGuide')} fill />
        </div>
      ) : (
        <EmptyState
          primaryText={t('noStyleGuideUploaded')}
          secondaryText={t('styleGuideEmptyText')}
          icon='reviewDocument'
          buttonProps={{
            children: (
              <div className='flex gap-8 align-items-center'>
                <Icon icon='upload' size='16px' />
                <span>{t('uploadPDF')}</span>
              </div>
            ),
            styleType: 'secondary',
            onClick: () => setPDFDrawerOpen(true),
          }}
        />
      )}
      <SideDrawer
        isOpen={PDFDrawerOpen}
        closeCallout={() => setPDFDrawerOpen(false)}
        headerContent={t('uploadStyleGuide')}
        footerContent={({ close }) => {
          return (
            <FormFooter
              cancelButtonProps={{ onClick: close }}
              saveButtonProps={{
                onClick: () => updateBrand({ guidelines: [''], id }), // TODO: update guidelines
                disabled: !file,
              }}
            />
          )
        }}
      >
        <FileUploader
          uploadCallout={(files) => setFile(files[0])}
          files={[...(file ? [file] : [])]}
          acceptedFileTypes={['.pdf']}
          formLabelProps={{ label: t('uploadPDF'), required: true }}
        />
      </SideDrawer>
    </DetailCard>
  )
}
