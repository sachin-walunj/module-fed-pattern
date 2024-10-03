import React, { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import {
  Checkbox,
  ListLoading,
  NewSelect,
  TagInput,
} from '@patterninc/react-ui'

import { Accordion, useTranslate } from '@amplifi-workspace/web-shared'

import CustomFolderTag from './CustomFolderTag'
import { FileDetails, getFileDetails } from '../actions'

import styles from './custom-information-section.module.scss'

type CustomInformationSectionProps = {
  fileID: string
}

type Topic = {
  id: string
  name: string
  is_hero: boolean
}
type CampaignType = {
  api_key: string
  display: string
}

const CustomInformationSection: React.FC<CustomInformationSectionProps> = ({
  fileID,
}) => {
  const [isUseMasterFile, setIsUseMasterFile] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [manualLabels, setManualLabels] = useState<string[]>([])
  const [selectedCampaignType, setSelectedCampaignType] =
    useState<CampaignType | null>(null)
  const { t } = useTranslate('portal')

  const {
    data: fileDetails,
    isLoading,
    isError,
    error,
  } = useQuery<FileDetails, Error>({
    queryKey: ['fileDetails', fileID],
    queryFn: () => getFileDetails(fileID),
    enabled: !!fileID,
  })

  useEffect(() => {
    if (fileDetails) {
      setIsUseMasterFile(fileDetails.use_master_file)
      setTopics(fileDetails.topics)
      setManualLabels(fileDetails.manual_label || [])
    }
  }, [fileDetails])

  if (isLoading) {
    return <ListLoading />
  }
  if (isError) {
    return <div>{t('errorLoadingFileDetails', { error: error.message })}</div>
  }

  if (!fileDetails) {
    return <div>{t('noFileDetailsAvailable')}</div>
  }

  const renderGeneralInformation = () => (
    <div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t('fileName')}</span>
        <span className={styles.infoValue}>{fileDetails.file_name}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t('createdBy')}</span>
        <span className={styles.infoValue}>{fileDetails.created_date}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t('fileSize')}</span>
        <span className={styles.infoValue}>{fileDetails.file_size}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>{t('Extension')}</span>
        <span className={styles.infoValue}>{fileDetails.format}</span>
      </div>
    </div>
  )

  const renderVariantInfo = (
    variantName: string,
    variantData: FileDetails['variants'][string]
  ) => (
    <Accordion title={variantName}>
      <div className={styles.variantInfo}>
        {Object.entries(variantData).map(([format, details]) => (
          <div key={format}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{format.toUpperCase()}</span>
              <span className={styles.infoValue}>
                <span className={styles.link}>{t('copyLink')}</span>
                <span className={styles.link}>{t('openLink')}</span>
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t('size')}</span>
              <span className={styles.infoValue}>{details?.size}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t('dimensions')}</span>
              <span className={styles.infoValue}>{details?.dimension}</span>
            </div>
          </div>
        ))}
      </div>
    </Accordion>
  )

  const renderVariants = () => (
    <div className={styles.variants}>
      {fileDetails?.variants &&
        Object.entries(fileDetails.variants).map(
          ([variantName, variantData]) => (
            <div key={variantName}>
              {renderVariantInfo(variantName, variantData)}
            </div>
          )
        )}
      {(!fileDetails?.variants ||
        Object.keys(fileDetails.variants).length === 0) && (
        <p>{t('noVariantsAvailable')}</p>
      )}
    </div>
  )
  const handleRemoveTag = (id: string) => {
    setTopics((prevTopics) => prevTopics.filter((topic) => topic.id !== id))
  }

  const handleTogglePrimary = (id: string) => {
    setTopics((prevTopics) =>
      prevTopics.map((topic) =>
        topic.id === id ? { ...topic, is_hero: !topic.is_hero } : topic
      )
    )
  }
  const handleCampaignTypeSelect = (option: CampaignType) => {
    setSelectedCampaignType(option)
    const newTopic: Topic = {
      id: option.api_key,
      name: option.display,
      is_hero: false,
    }
    setTopics((prevTopics) => [...prevTopics, newTopic])
  }

  const handleManualLabelChange = (newLabels: string[]) => {
    setManualLabels(newLabels)
  }
  const renderDetails = () => (
    <>
      <Accordion title={t('folderTags')} nested={true}>
        <div className='mb-8'>
          <NewSelect
            searchBarProps={{
              showSearchBar: true,
              placeholder: t('searchToAddaFolderTags'),
            }}
            options={[
              {
                api_key: 'all',
                display: 'All Campaign Types',
              },
              {
                api_key: 'sp',
                display: 'SP',
              },
              {
                api_key: 'sb',
                display: 'SB',
              },
              {
                api_key: 'sd',
                display: 'SD',
              },
            ]}
            optionKeyName='api_key'
            labelKeyName='display'
            selectedItem={selectedCampaignType || { api_key: '', display: '' }}
            onChange={handleCampaignTypeSelect}
          ></NewSelect>
        </div>
        <div className='flex flex-wrap gap-4'>
          {topics.map((topic) => (
            <CustomFolderTag
              key={topic.id}
              label={topic.name}
              isPrimary={topic.is_hero}
              onRemove={() => handleRemoveTag(topic.id)}
              onTogglePrimary={() => handleTogglePrimary(topic.id)}
            />
          ))}
        </div>
      </Accordion>
      <Accordion title={t('caption')} nested={true}>
        <p>{t('caption')}</p>
      </Accordion>
      <Accordion title={t('labelTags')} nested={true}>
        <TagInput
          placeholder={t('addATag')}
          tags={manualLabels}
          setTags={(newLabels) =>
            handleManualLabelChange(newLabels as string[])
          }
        />
      </Accordion>
    </>
  )

  const renderDisplay = () => (
    <Checkbox
      checked={isUseMasterFile}
      label={t('useMasterFile')}
      name='useMasterFile'
    />
  )

  const renderFileMetadata = () => {
    if (
      !fileDetails?.metadata ||
      Object.keys(fileDetails.metadata).length === 0
    ) {
      return <p>{t('noMetaDataAvailable')}</p>
    }

    return (
      <>
        {Object.entries(fileDetails.metadata).map(([key, value]) => (
          <Accordion key={key} title={key}>
            <p>{value?.toString() || 'N/A'}</p>
          </Accordion>
        ))}
      </>
    )
  }

  const renderVisibility = () => (
    <>
      <Accordion title={t('published')}>
        <p>{fileDetails.published ? t('yes') : t('no')}</p>
      </Accordion>
      <Accordion title={t('regions')}>
        {fileDetails.region_ids.map((region, index) => (
          <p key={index}>{region}</p>
        ))}
      </Accordion>
      <Accordion title={t('roles')}>
        {fileDetails.roles.map((role, index) => (
          <p key={index}>{role}</p>
        ))}
      </Accordion>
    </>
  )

  return (
    <div>
      <Accordion title={t('generalInformation')}>
        {renderGeneralInformation()}
      </Accordion>
      <Accordion title={t('display')}>{renderDisplay()}</Accordion>
      <Accordion title={t('variants')}>{renderVariants()}</Accordion>
      <Accordion title={t('details')}>{renderDetails()}</Accordion>
      <Accordion title={t('fileMetaData')}>{renderFileMetadata()}</Accordion>
      <Accordion title={t('visibility')}>{renderVisibility()}</Accordion>
    </div>
  )
}

export default CustomInformationSection
