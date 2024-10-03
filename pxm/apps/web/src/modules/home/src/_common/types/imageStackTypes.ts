export interface ImageStackCardData {
  id: string
  fileProps: {
    data: string[]
    name: string
    url: string
  }
  files: {
    file_name: string
    id: string
    imageUrl: string
  }[]
}

export interface ImageCardType {
  id: string
  file_name: string
  imageUrl: string
}

export interface AddImageCardProps {
  id: string
  file_name: string
  imageUrl: string[]
}
