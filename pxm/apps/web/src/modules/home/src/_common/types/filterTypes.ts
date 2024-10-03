import moment from 'moment'

export interface PrimaryColorOption {
  id: number
  state: string
  value: string
}

export interface MetaDataLimiterOption {
  id: number
  text: string
  value: string
}

export interface FiltersTypes {
  searchtype: 'folders' | 'files'
  publishStatus: 'all' | 'published' | 'unpublished'
  fileType: string[]
  primaryColor: PrimaryColorOption
  date_range: {
    start_date: moment.Moment
    end_date: moment.Moment
  }
  fileSize: 'any' | string
  masterFileSize: 'any' | string
  metaDataLimiter: MetaDataLimiterOption
}

export const initialFilters: FiltersTypes = {
  searchtype: 'folders',
  publishStatus: 'all',
  fileType: [],
  primaryColor: {
    id: 0,
    state: 'All Colors',
    value: 'all',
  },
  date_range: {
    start_date: moment(),
    end_date: moment(),
  },
  fileSize: 'any',
  masterFileSize: 'any',
  metaDataLimiter: {
    id: 0,
    text: 'Select one',
    value: 'selectone',
  },
}
