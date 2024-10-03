'use client'
import { SetStateAction, useMemo } from 'react'

import moment from 'moment'

import { FilterStatesType } from '@patterninc/react-ui/dist/components/Filter/FilterMenu'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { FiltersTypes as Filters } from '../_common/types/filterTypes'

interface Option {
  id?: number
  color?: string
  text?: string
  value?: string
  state?: string
  label?: string
  date_range?: {
    start_date: moment.Moment
    end_date: moment.Moment
  }
}

export const usePageHeader = (
  initialFilters: Filters,
  setFilters: (value: SetStateAction<Filters>) => void
) => {
  const { t } = useTranslate('portal')
  const updateFilters = (newFilters: SetStateAction<Filters>) => {
    setFilters(newFilters)
  }

  const allFilters: FilterStatesType<Option> = useMemo(() => {
    const primaryColorOptions: Option[] = [
      {
        id: 0,
        state: t('allColors'),
        value: 'all',
      },
      {
        id: 1,
        state: t('black'),
        value: 'black',
      },
      {
        id: 2,
        state: t('green'),
        value: 'green',
      },
      {
        id: 3,
        state: t('orange'),
        value: 'orange',
      },
      {
        id: 4,
        state: t('pink'),
        value: 'pink',
      },
      {
        id: 5,
        state: t('purple'),
        value: 'purple',
      },
      {
        id: 6,
        state: t('red'),
        value: 'red',
      },
      {
        id: 7,
        state: t('yellow'),
        value: 'yellow',
      },
      {
        id: 8,
        state: t('white'),
        value: 'white',
      },
    ]
    const filtersObj: FilterStatesType<Option> = {
      searchtype: {
        type: 'toggle',
        defaultValue: initialFilters.searchtype,
        labelText: t('searchType'),
        stateName: 'searchtype',
        options: [
          {
            id: 0,
            text: c('all'),
            value: 'all',
          },
          {
            id: 1,
            text: c('folders'),
            value: 'folders',
          },
          {
            id: 2,
            text: c('files'),
            value: 'files',
          },
        ],
      },
      publishStatus: {
        type: 'toggle',
        defaultValue: initialFilters.publishStatus,
        labelText: t('publishStatus'),
        stateName: 'publishStatus',
        options: [
          {
            id: 0,
            text: c('all'),
            value: 'all',
          },
          {
            id: 1,
            text: c('published'),
            value: 'published',
          },
          {
            id: 2,
            text: c('unpublished'),
            value: 'unpublished',
          },
        ],
      },
    }

    if (initialFilters.searchtype === 'folders') {
      filtersObj.primaryColor = {
        type: 'select',
        defaultValue: initialFilters.primaryColor,
        labelText: t('primaryColor'),
        stateName: 'primaryColor',
        optionKeyName: 'state',

        options: primaryColorOptions,
      }

      filtersObj.createdDate = {
        labelText: t('createdDate'),
        stateName: 'date_range',
        type: 'dates',
        defaultValue: {
          start_date: initialFilters.date_range.start_date,
          end_date: initialFilters.date_range.end_date,
        },
        hideCustomDateSearch: true,
      }
    }

    if (initialFilters.searchtype === 'files') {
      filtersObj.fileType = {
        type: 'multiple-selection',
        options: [
          { id: 1, name: c('images') },
          { id: 2, name: c('videos') },
          { id: 3, name: c('documents') },
          { id: 4, name: c('misc') },
        ],
        stateName: 'fileType',
        optionKeyName: 'name',
        labelText: t('originalFileType'),
        selectPlaceholder: t('selectFileType'),
        searchPlaceholder: t('searchFileType'),
        selectedOptions: initialFilters.fileType,
      }

      filtersObj.primaryColor = {
        type: 'select',
        defaultValue: initialFilters.primaryColor,
        labelText: t('primaryColor'),
        stateName: 'primaryColor',
        optionKeyName: 'state',
        options: primaryColorOptions,
      }

      filtersObj.uploadedDate = {
        labelText: t('uploadedDate'),
        stateName: 'date_range',
        type: 'dates',
        defaultValue: {
          start_date: initialFilters.date_range.start_date,
          end_date: initialFilters.date_range.end_date,
        },
        hideCustomDateSearch: true,
      }

      filtersObj.fileSize = {
        type: 'toggle',
        labelText: t('originalFileSize'),
        stateName: 'fileSize',
        options: [
          {
            id: 1,
            text: c('any'),
            value: 'any',
          },
          {
            id: 2,
            text: c('largerThan'),
            value: 'largerThan',
          },
          {
            id: 3,
            text: c('smallerThan'),
            value: 'smallerThan',
          },
          {
            id: 4,
            text: c('equalTo'),
            value: 'equalTo',
          },
        ],
        defaultValue: initialFilters.fileSize,
      }

      filtersObj.masterFileSize = {
        type: 'toggle',
        labelText: 'Master File Size',
        stateName: 'masterFileSize',
        options: [
          {
            id: 1,
            text: c('any'),
            value: 'any',
          },
          {
            id: 2,
            text: c('largerThan'),
            value: 'largerThan',
          },
          {
            id: 3,
            text: c('smallerThan'),
            value: 'smallerThan',
          },
          {
            id: 4,
            text: c('equalTo'),
            value: 'equalTo',
          },
        ],
        defaultValue: initialFilters.masterFileSize,
      }

      filtersObj.metaDataLimiter = {
        type: 'select',
        searchBar: true,
        defaultValue: initialFilters.metaDataLimiter,

        labelText: t('metadataLimiter'),
        stateName: 'metaDataLimiter',
        optionKeyName: 'text',
        options: [
          {
            id: 1,
            text: c('album'),
            value: 'album',
          },
          {
            id: 2,
            text: c('artist'),
            value: 'artist',
          },
          {
            id: 3,
            text: c('caption'),
            value: 'caption',
          },
        ],
      }
    }

    return filtersObj
  }, [
    initialFilters.date_range.end_date,
    initialFilters.date_range.start_date,
    initialFilters.fileSize,
    initialFilters.fileType,
    initialFilters.masterFileSize,
    initialFilters.metaDataLimiter,
    initialFilters.primaryColor,
    initialFilters.publishStatus,
    initialFilters.searchtype,
  ])

  return { allFilters, updateFilters }
}
export type { Filters }
