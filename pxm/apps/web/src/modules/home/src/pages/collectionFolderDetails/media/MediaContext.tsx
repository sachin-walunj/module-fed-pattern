'use client'
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'

import { MediaViewerFileProps } from '@patterninc/react-ui'

export interface APIHit {
  _index: string
  _id: string
  _score: number
  _source: {
    id: string
    file_name: string
    file_path: string
  }
}

interface MediaContextType {
  apiData: APIHit[]
  setApiData: (data: APIHit[]) => void
  mediaFiles: MediaViewerFileProps[]
  setMediaFiles: (files: MediaViewerFileProps[]) => void
  activeFileId: string | null
  setActiveFileId: (id: string | null) => void
  fileIdMapping: Record<string, string>
  setFileIdMapping: (mapping: Record<string, string>) => void
  currentMediaId: string
  setCurrentMediaId: (id: string) => void
}

const MediaContext = createContext<MediaContextType | undefined>(undefined)

interface MediaProviderProps {
  children: ReactNode
}

export const MediaProvider: React.FC<MediaProviderProps> = ({ children }) => {
  const [apiData, setApiData] = useState<APIHit[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaViewerFileProps[]>([])
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [fileIdMapping, setFileIdMapping] = useState<Record<string, string>>({})
  const [currentMediaId, setCurrentMediaId] = useState<string>('')

  const contextValue = {
    apiData,
    setApiData: useCallback((data: APIHit[]) => setApiData(data), []),
    mediaFiles,
    setMediaFiles: useCallback(
      (files: MediaViewerFileProps[]) => setMediaFiles(files),
      []
    ),
    activeFileId,
    setActiveFileId: useCallback(
      (id: string | null) => setActiveFileId(id),
      []
    ),
    fileIdMapping,
    setFileIdMapping: useCallback(
      (mapping: Record<string, string>) => setFileIdMapping(mapping),
      []
    ),
    currentMediaId,
    setCurrentMediaId: useCallback((id: string) => setCurrentMediaId(id), []),
  }

  return (
    <MediaContext.Provider value={contextValue}>
      {children}
    </MediaContext.Provider>
  )
}

export const useMediaContext = () => {
  const context = useContext(MediaContext)
  if (context === undefined) {
    throw new Error('useImageContext must be used within an ImageProvider')
  }
  return context
}
