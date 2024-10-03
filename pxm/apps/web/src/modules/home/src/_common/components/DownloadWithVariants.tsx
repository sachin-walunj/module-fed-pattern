'use client'
import React, { useEffect, useState } from 'react'

import {
  Button,
  capitalize,
  Checkbox,
  MultiSelect,
  SideDrawer,
  toast,
} from '@patterninc/react-ui'

import { RootState, useAppSelector } from '@amplifi-workspace/store'
import { useTranslate } from '@amplifi-workspace/web-shared'

import {
  DownloadWithVariantsProps,
  ExtendedVariantType,
  MultiSelectOptions,
  TypesOfExtensions,
  TypesOfSizes,
  TypesOfVariants,
  VariantType,
} from '../types/downloadVariantTypes'

import styles from './download-with-variants.module.scss'

export const DownloadWithVariants: React.FC<DownloadWithVariantsProps> = ({
  isOpen,
  onClose,
  onDownload,
  variantsList,
}) => {
  const { t } = useTranslate('portal')
  const { t: tCommon } = useTranslate('common')
  const variants = useAppSelector((state: RootState) => state.variants)
  const [selectedImageVariants, setSelectedImageVariants] = useState<
    Array<MultiSelectOptions>
  >([])
  const [selectedVideoVariants, setSelectedVideoVariants] = useState<
    Array<MultiSelectOptions>
  >([])
  const [selectedMiscVariants, setSelectedMiscVariants] =
    useState<boolean>(false)
  const [selectedDocumentVariants, setSelectedDocumentVariants] =
    useState<boolean>(false)
  const [filteredArray, setFilteredArray] = useState<
    Array<ExtendedVariantType>
  >([])

  const generateFileConfig = () => {
    const fileConfig = {
      count: 0,
      image: {
        original: false,
        large: {
          png: false,
          jpg: false,
          webp: false,
        },
        medium: {
          png: false,
          jpg: false,
          webp: false,
        },
        small: {
          png: false,
          jpg: false,
          webp: false,
        },
        thumb: {
          png: false,
          jpg: false,
          webp: false,
        },
      },
      video: {
        original: false,
        preview: {
          mp4: false,
        },
        thumb: {
          jpg: false,
        },
      },
      document: {
        original: false,
      },
      misc: {
        original: false,
      },
    }

    const newSelectedVariants: Array<ExtendedVariantType> = []
    if (selectedImageVariants) {
      newSelectedVariants.push(...selectedImageVariants)
    }
    if (selectedVideoVariants) {
      newSelectedVariants.push(...selectedVideoVariants)
    }
    if (selectedMiscVariants) {
      newSelectedVariants.push({
        type: 'misc',
        dim: '',
        ext: null,
        size: 'original',
        key: `misc-original`,
        checked: true,
      })
    }
    if (selectedDocumentVariants)
      newSelectedVariants.push({
        type: 'document',
        dim: '',
        ext: null,
        size: 'original',
        key: `document-original`,
        checked: true,
      })

    if (!newSelectedVariants.length) {
      toast({
        type: 'error',
        message: 'Please select a variant to download',
      })
      return
    }
    // Looping through the selectedVariant array to generate the file config
    newSelectedVariants.forEach(({ type, ext, size }) => {
      if (size === 'original') {
        fileConfig[type]['original'] = true
      } else if (
        type === 'image' &&
        size !== 'preview' &&
        ext &&
        ext !== 'mp4'
      ) {
        fileConfig['image'][size][ext] = true
      } else if (type === 'video') {
        if (size === 'preview') fileConfig['video']['preview']['mp4'] = true
        else fileConfig['video']['thumb']['jpg'] = true
      }
    })
    fileConfig.count = newSelectedVariants.length
    onDownload(fileConfig)
  }

  useEffect(() => {
    // Combine the variants and add unique key and groupDataKey using reduce
    const combinedArrayWithKeys: Array<[string, Array<VariantType>]> =
      Object.entries(variants)
    const filtered_Array: Array<ExtendedVariantType> = []

    variantsList.forEach((variant) => {
      const variantType = variant as TypesOfVariants

      // Updating the table data
      filtered_Array.push({
        size: 'original',
        ext: null,
        dim: '',
        key: `${variantType}-original`,
        type: `${variantType}`,
        checked: true,
      })
      const variantDetails = combinedArrayWithKeys.filter(
        (type) => type[0] === variant
      )
      if (variantDetails.length) {
        const type = variantDetails[0][0] as TypesOfVariants
        variantDetails[0][1].forEach((item: VariantType) => {
          filtered_Array.push({
            ...item,
            key: `${type}-${item.size}-${item.ext}`,
            type,
            checked: false,
          })
        })
      }
    })
    setFilteredArray(filtered_Array)
    setSelectedImageVariants([])
    setSelectedVideoVariants([])
    setSelectedMiscVariants(false)
    setSelectedDocumentVariants(false)
  }, [variants, variantsList])

  // function to set the option list for each file type
  const multiSelectOptions = (variant: TypesOfVariants) => {
    const options =
      filteredArray
        .filter((typeVariant) => typeVariant.type === variant)
        .map((typeVariant) => ({
          label: typeVariant.ext
            ? `${capitalize(typeVariant.size)} - ${typeVariant.ext}`
            : `${capitalize(typeVariant.size)}`,
          secondaryOption: typeVariant.ext && `${typeVariant.dim} px`,
        })) ?? []

    return options
  }

  // funtion to update the selected variant list
  const handleUserSelection = (
    data: {
      label: string
      secondaryOption: string | null
    }[],
    variant: TypesOfVariants
  ) => {
    const selectedVariants: Array<MultiSelectOptions> = []
    data.forEach((selectedVariant) => {
      const size = selectedVariant.label.toLowerCase() as TypesOfSizes
      const extnAndDim = selectedVariant?.secondaryOption
        ?.split(' | ')
        .map((data) => data.trim())
      selectedVariants.push({
        type: variant,
        label: selectedVariant.label,
        size,
        dim: extnAndDim ? extnAndDim[0] : '',
        ext: extnAndDim ? (extnAndDim[1] as TypesOfExtensions) : null,
        secondaryOption: selectedVariant?.secondaryOption,
      })
    })
    if (variant === 'image') {
      setSelectedImageVariants(selectedVariants)
    } else {
      setSelectedVideoVariants(selectedVariants)
    }
  }

  const handleFileSelection = (__: unknown, status: boolean) => {
    if (variantsList.includes('misc')) setSelectedMiscVariants(status)

    if (variantsList.includes('document')) setSelectedDocumentVariants(status)
  }

  return (
    <SideDrawer
      footerContent={
        <div className='flex justify-content-between'>
          <Button onClick={onClose}>{tCommon('cancel')}</Button>
          <Button
            styleType='primary-blue'
            onClick={() => generateFileConfig()}
            // disabled={!selectedDownloadAttGroups.length}
          >
            {tCommon('download')}
          </Button>
        </div>
      }
      headerContent={t('downloadPreferences')}
      isOpen={isOpen}
      closeCallout={onClose}
    >
      <>
        {variantsList
          .filter((variant) => ['image', 'video'].includes(variant))
          .map((variant) => (
            <span className={styles.variantSelector}>
              <MultiSelect
                emptyStateProps={{
                  primaryText: `No ${capitalize(variant)} Variants Found`,
                  secondaryText: 'Try changing your settings',
                }}
                exposed
                formLabelProps={{
                  label: `Available ${capitalize(variant)} Variants`,
                }}
                options={multiSelectOptions(variant)}
                labelKey={'label'}
                callout={(data) => handleUserSelection(data, variant)}
                selectedOptions={
                  variant === 'image'
                    ? selectedImageVariants.map((term) => ({
                        label: term.label,
                        secondaryOption: term?.secondaryOption,
                      }))
                    : selectedVideoVariants.map((term) => ({
                        label: term.label,
                        secondaryOption: term?.secondaryOption,
                      }))
                }
              />
            </span>
          ))}
        {variantsList.some((variant) =>
          ['misc', 'document'].includes(variant)
        ) && (
          <>
            <div className='fs-12 pb-8'>Available File Variants</div>
            <span
              className={
                styles.variantSelector + ' p-8 bdr bdrr-4 bdrc-medium-purple'
              }
            >
              <Checkbox label='Original' callout={handleFileSelection} />
            </span>
          </>
        )}
      </>
    </SideDrawer>
  )
}
