export interface FileConfig {
  count: number
  image: {
    original: boolean
    large: {
      png: boolean
      jpg: boolean
      webp: boolean
    }
    medium: {
      png: boolean
      jpg: boolean
      webp: boolean
    }
    small: {
      png: boolean
      jpg: boolean
      webp: boolean
    }
    thumb: {
      png: boolean
      jpg: boolean
      webp: boolean
    }
  }
  video: {
    original: boolean
    preview: {
      mp4: boolean
    }
    thumb: {
      jpg: boolean
    }
  }
  document: {
    original: boolean
  }
  misc: {
    original: boolean
  }
}

export interface variantsType {
  image: {
    dim: string | number
    ext: string
    size: string
  }[]
  video: {
    dim: string | number
    ext: string
    size: string
  }[]
}

export interface VariantType {
  dim: string | number
  ext: TypesOfExtensions
  size: TypesOfSizes
}

export interface ExtendedVariantType {
  dim: string | number
  ext: TypesOfExtensions
  size: TypesOfSizes
  key?: string
  type: TypesOfVariants
  checked?: boolean
}

export interface MultiSelectOptions {
  dim: string | number
  ext: TypesOfExtensions
  size: TypesOfSizes
  label: string
  secondaryOption: string | null
  type: TypesOfVariants
}

export interface DownloadWithVariantsProps {
  isOpen: boolean
  onClose: () => void
  onDownload: (fileConfig: FileConfig) => void
  variantsList: TypesOfVariants[]
}

export type TypesOfVariants = 'image' | 'video' | 'misc' | 'document'
export type TypesOfExtensions = 'png' | 'jpg' | 'webp' | 'mp4' | null
export type TypesOfSizes =
  | 'original'
  | 'large'
  | 'medium'
  | 'small'
  | 'thumb'
  | 'preview'
