'use client'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'

import {
  BreadcrumbType,
  MediaViewerFileProps,
  MediaViewerNew,
  PageFooter,
  toast,
} from '@patterninc/react-ui'

import {
  BreadcrumbContext,
  useQueryState,
  useTranslate,
} from '@amplifi-workspace/web-shared'

import { useMediaContext } from './MediaContext'
import { ROOT_LEVEL_BREADCRUMBS } from '../../home/home'
import {
  fetchLinks,
  FetchLinksPayload,
  getTopic,
  LinkData,
  LinkResponse,
} from '../actions'

import styles from './new-media-viewer.module.scss'

interface LinkMediaviewerProps {
  initialMediaId: string
  collectionFolderId: string
}

interface TopicData {
  hierarchy: Array<{ name: string; id: string }>
  name: string
}

const defaultFile: MediaViewerFileProps = {
  name: '',
  isChecked: false,
  url: '',
  fileData: [],
}

const mapLinkDataToMediaProps = (linkData: LinkData): MediaViewerFileProps => {
  return {
    name: linkData.description,
    isChecked: false,
    url: linkData.image,
    fileData: [
      { label: 'Description', value: linkData.description },
      { label: 'Link', value: linkData.link },
    ],
  }
}

export const LinkMediaviewer: React.FC<LinkMediaviewerProps> = ({
  initialMediaId,
  collectionFolderId,
}) => {
  const {
    setApiData,
    mediaFiles,
    setMediaFiles,
    activeFileId,
    setActiveFileId,
    fileIdMapping,
    setFileIdMapping,
  } = useMediaContext()
  const [activeFile, setActiveFile] = useQueryState<string>({
    key: 'activeFile',
    defaultValue: initialMediaId,
  })

  const [isInitialized, setIsInitialized] = useState(false)

  const currentPath = usePathname()

  const { updateBreadcrumbs } = useContext(BreadcrumbContext)
  const { t } = useTranslate('portal')

  const { data: topicData } = useQuery<TopicData, Error>({
    queryKey: ['getTopic', collectionFolderId],
    queryFn: () => getTopic(collectionFolderId),
    enabled: !!collectionFolderId,
  })

  const fetchLinksMutation = useMutation<
    LinkResponse,
    Error,
    FetchLinksPayload
  >({
    mutationFn: fetchLinks,
  })

  const { data, isLoading } = useInfiniteQuery<
    LinkResponse,
    Error,
    { pages: LinkResponse[]; pageParams: number[] },
    [string, string],
    number
  >({
    queryKey: ['fetchLinks', collectionFolderId],
    queryFn: async ({ pageParam = 0 }) => {
      const payload: FetchLinksPayload = {
        start: pageParam * 50,
        limit: 50,
        sort_column: 'created_date',
        sort_direction: 'desc',
        entity: 'topic',
        entity_id: collectionFolderId,
        reset_current_page: false,
        sort: 'alphabetical',
      }
      return fetchLinksMutation.mutateAsync(payload)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.count / 50)
      return allPages.length < totalPages ? allPages.length : undefined
    },
  })

  const updateBreadcrumbsOnDetailsLayout = useCallback(() => {
    if (
      topicData?.hierarchy &&
      topicData.hierarchy.length > 0 &&
      topicData.name
    ) {
      const hierarchyName = topicData.hierarchy[0]?.name || ''
      const hierarchyId = topicData.hierarchy[0]?.id || ''

      const hierarchyLevels: BreadcrumbType[] = hierarchyName
        .split(' > ')
        .filter((level) => level !== 'Super')
        .map((level) => ({
          name: level,
          link: `/v3/portal?folderId=${encodeURIComponent(
            JSON.stringify(hierarchyId)
          )}`,
          changeType: 'tab',
        }))

      const newBreadcrumbs: BreadcrumbType[] = [
        ...ROOT_LEVEL_BREADCRUMBS,
        ...hierarchyLevels,
      ]

      if (
        topicData.name &&
        currentPath &&
        topicData.name !== hierarchyLevels[hierarchyLevels.length - 1]?.name
      ) {
        const pathSegments = currentPath.split('/')
        const newPath = pathSegments.slice(0, -1).join('/')
        const cleanPath = newPath.endsWith('/') ? newPath.slice(0, -1) : newPath

        newBreadcrumbs.push({
          name: topicData.name,
          link: `${cleanPath}/links`,
          changeType: 'tab',
        })
      }

      const activeFileName =
        activeFileId || data?.pages[0]?.data[0]?.description
      newBreadcrumbs.push({
        name: activeFileName || '',
        link: currentPath,
        changeType: 'tab',
      })

      updateBreadcrumbs(newBreadcrumbs)
    }
  }, [
    topicData?.hierarchy,
    topicData?.name,
    currentPath,
    activeFileId,
    data?.pages,
    updateBreadcrumbs,
  ])

  useEffect(() => {
    if (topicData && data?.pages[0]) {
      updateBreadcrumbsOnDetailsLayout()
    }
  }, [updateBreadcrumbsOnDetailsLayout, topicData, data])

  useEffect(() => {
    if (data && !isInitialized) {
      const newApiData = data.pages.flatMap((page) => page.data)
      const newMediaFiles = newApiData.map(mapLinkDataToMediaProps)
      const newFileIdMapping = Object.fromEntries(
        newApiData.map((item: LinkData) => [item.id, item.description])
      )

      const transformedApiData = newApiData.map((item) => ({
        _index: '',
        _id: item.id,
        _score: 0,
        _source: {
          ...item,
          file_name: item.description,
          file_path: item.link,
        },
      }))
      setApiData(transformedApiData)
      setMediaFiles(newMediaFiles)
      setFileIdMapping(newFileIdMapping)
      setIsInitialized(true)
    }
  }, [data, isInitialized, setApiData, setMediaFiles, setFileIdMapping])

  useEffect(() => {
    if (isInitialized && mediaFiles.length > 0) {
      const initialFile =
        mediaFiles.find(
          (file) => fileIdMapping[initialMediaId] === file.name
        ) || mediaFiles[0]
      setActiveFileId(initialFile.name)
    }
  }, [
    isInitialized,
    mediaFiles,
    initialMediaId,
    fileIdMapping,
    setActiveFileId,
  ])

  useEffect(() => {
    if (mediaFiles.length > 0) {
      const fileId = activeFile || initialMediaId
      if (fileId && fileIdMapping[fileId]) {
        setActiveFileId(fileIdMapping[fileId])
      } else {
        setActiveFileId(mediaFiles[0].name)
      }
    }
  }, [mediaFiles, activeFile, initialMediaId, fileIdMapping, setActiveFileId])

  const handleFileChange = useCallback(
    (newFile: MediaViewerFileProps) => {
      const fileId = Object.keys(fileIdMapping).find(
        (key) => fileIdMapping[key] === newFile.name
      )
      if (fileId) {
        setActiveFile(fileId)
      }
      setActiveFileId(newFile.name)
    },
    [fileIdMapping, setActiveFile, setActiveFileId]
  )

  const activeFileObj = useMemo(
    () => mediaFiles.find((file) => file.name === activeFileId) || defaultFile,
    [mediaFiles, activeFileId]
  )

  if (isLoading) {
    return <div>{t('loading')}</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.mediaViewerWrapper}>
        <MediaViewerNew
          activeFile={activeFileObj}
          activeFileCallout={handleFileChange}
          file={activeFileObj}
          files={mediaFiles.length > 0 ? mediaFiles : [defaultFile]}
          checkboxProps={{
            infoCheckboxProps: {
              checked: false,
              label: 'Info Checkbox',
            },
            checkboxTooltip: {
              children: undefined,
              tooltipContent: undefined,
              position: undefined,
              customClass: undefined,
              extraProps: undefined,
              maxWidth: undefined,
              useSideDrawerForMobile: undefined,
              sideDrawerHeader: undefined,
              scrollSelector: undefined,
              scrollDistance: undefined,
            },
          }}
        />
      </div>
      <PageFooter
        leftSection={{
          type: 'button',
          as: 'button',
          children: 'Delete',
          styleType: 'text-red',
          onClick: () => {
            toast({ message: 'Delete clicked', type: 'error' })
          },
        }}
        rightSection={[
          {
            type: 'buttonGroup',
            buttons: [
              {
                icon: 'download',
                onClick: () =>
                  toast({
                    message: 'You clicked the download button!',
                    type: 'success',
                  }),
                tooltip: {
                  tooltipContent:
                    'This is the tooltip to explain what the download button will do.',
                },
              },
              {
                icon: 'layers',
                onClick: () =>
                  toast({
                    message: 'You clicked the layers button!',
                    type: 'success',
                  }),
                tooltip: {
                  tooltipContent:
                    'This is the tooltip to explain what the layers button will do.',
                },
              },
            ],
          },
          {
            type: 'button',
            children: 'Save',
            styleType: 'primary-blue',
            onClick: () => {
              toast({ message: 'Save clicked', type: 'success' })
            },
          },
        ]}
      />
    </div>
  )
}
