'use client'

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'

import {
  BreadcrumbType,
  MediaViewerFileProps,
  MediaViewerNew,
  PageFooter,
  toast,
} from '@patterninc/react-ui'

import { useAppSelector } from '@amplifi-workspace/store'
import {
  BreadcrumbContext,
  useQueryState,
  useTranslate,
} from '@amplifi-workspace/web-shared'

import CustomInformationSection from './CustomInformationSection'
import { APIHit, useMediaContext } from './MediaContext'
import { DownloadWithVariants } from '../../../_common/components/DownloadWithVariants'
import {
  FileConfig,
  TypesOfVariants,
} from '../../../_common/types/downloadVariantTypes'
import { GenerateDownload } from '../../../_common/utils/download'
import { ROOT_LEVEL_BREADCRUMBS } from '../../home/home'
import { getTopic, searchProducts } from '../actions'

import styles from './new-media-viewer.module.scss'

interface NewMediaviewerProps {
  initialMediaId: string
  collectionFolderId: string
  mediaType: 'image' | 'video' | 'misc'
}

const defaultFile: MediaViewerFileProps = {
  name: '',
  isChecked: false,
  url: '',
  fileData: [],
}

const mapApiToMediaProps = (
  apiData: APIHit,
  mediaType: 'image' | 'video' | 'misc'
): MediaViewerFileProps => {
  let imageUrl: string
  let playableFileUrl: { videoUrl: string } | undefined

  switch (mediaType) {
    case 'image':
      imageUrl = `${process.env.CLIENT_CDN_ENDPOINT}/${apiData._source.id}.jpg`
      break
    case 'misc':
      imageUrl = `${process.env.CLIENT_CDN_ENDPOINT}/${apiData._source.id}_thumb.png`
      break
    case 'video':
      imageUrl = `${process.env.CLIENT_CDN_ENDPOINT}/${apiData._source.id}_thumb.jpg`
      playableFileUrl = {
        videoUrl: `${process.env.CLIENT_CDN_ENDPOINT}/${apiData._source.id}`,
      }
      break
    default:
      imageUrl = `${process.env.CLIENT_CDN_ENDPOINT}/${apiData._source.id}_thumb.png`
  }

  return {
    name: apiData._source.file_name,
    isChecked: false,
    url: imageUrl,
    playableFileUrl,
    fileData: [{ label: 'File Name', value: apiData._source.file_name }],
  }
}

export const NewMediaviewer: React.FC<NewMediaviewerProps> = ({
  initialMediaId,
  collectionFolderId,
  mediaType,
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
  const user = useAppSelector((state) => state.user)

  const [isInitialized, setIsInitialized] = useState(false)
  const [isDownloadDrawerOpen, setIsDownloadDrawerOpen] =
    useState<boolean>(false)
  const currentPath = usePathname()
  const downloadFiles = GenerateDownload()
  const { updateBreadcrumbs } = useContext(BreadcrumbContext)
  const { t } = useTranslate('portal')

  const { data: topicData } = useQuery({
    queryKey: ['getTopic', collectionFolderId],
    queryFn: () => getTopic(collectionFolderId),
    enabled: !!collectionFolderId,
  })

  const { data, isLoading } = useInfiniteQuery({
    queryKey: ['searchProducts', collectionFolderId, mediaType],
    queryFn: async ({ pageParam = 0 }) => {
      const payload = {
        filter: {
          terms: {
            topics: [collectionFolderId],
            roles: [user?.role],
            region: user?.regions?.map((region) => region.id) || [],
          },
        },
        type: [mediaType],
        search: '',
        sort: 'alphabetical',
        from: String(pageParam * 50),
        size: '200', // TODO: This will be removed once we made the changes in the API to return the files based on the ImageId
      }
      return searchProducts(payload, pageParam)
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / 50)
      return allPages.length < totalPages ? allPages.length : undefined
    },

    initialPageParam: 0,
  })

  const updateBreadcrumbsOnDetailsLayout = useCallback(() => {
    if (
      topicData?.hierarchy &&
      topicData.hierarchy.length > 0 &&
      topicData.name
    ) {
      const hierarchyName = topicData.hierarchy[0]?.name || ''
      const hierarchyId = topicData.hierarchy[0]?.id || ''
      // The below logic is to parse the Category hierarchy which we get in the format
      // name: 'Super > 001 - CARDING > SubCarding'  from the API
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
      //This logic is to add the breadcrumb for selected topic as we dont get it in the hierarchy from the response
      if (
        topicData.name &&
        currentPath &&
        topicData.name !== hierarchyLevels[hierarchyLevels.length - 1]?.name
      ) {
        const pathSegments = currentPath.split('/')
        // Remove the last segment (ID) and join the remaining segments
        const newPath = pathSegments.slice(0, -1).join('/')
        // Remove trailing slash if it exists
        const cleanPath = newPath.endsWith('/') ? newPath.slice(0, -1) : newPath
        //This is pluralized because the API call needs singular mediaType and the breadcrumb needs pluralized mediaType
        const pluralizedMediaType =
          mediaType === 'misc' ? mediaType : `${mediaType}s`

        newBreadcrumbs.push({
          name: topicData.name,
          link: `${cleanPath}/${pluralizedMediaType}`,
          changeType: 'tab',
        })
      }
      const activeFileName =
        activeFileId || data?.pages[0].hits[0]._source.file_name
      newBreadcrumbs.push({
        name: activeFileName,
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
    mediaType,
  ])

  const downloadVariants = (fileConfig: FileConfig) => {
    const activeName = data?.pages[0].hits[0]._source.file_name ?? ''

    if (activeName !== '' || activeFile !== null || activeFile !== undefined) {
      // Getting the data in the required format
      const payload = {
        entities: [
          {
            name: activeName,
            id: activeFile,
            type: 'file',
          },
        ],
        file_config: fileConfig,
        entity_type: 'file',
        role: user?.role,
        region: user?.regions.map((region) => region.id),
        wait: true,
      }

      downloadFiles(payload) // API call for /file/compress

      setIsDownloadDrawerOpen(false)
    } else
      toast({
        type: 'error',
        message: t('unableToFetchDetails'),
      })
  }

  useEffect(() => {
    if (topicData && data?.pages[0]?.hits[0]) {
      updateBreadcrumbsOnDetailsLayout()
    }
  }, [updateBreadcrumbsOnDetailsLayout, topicData, data])

  useEffect(() => {
    if (data && !isInitialized) {
      const newApiData = data.pages.flatMap((page) => page.hits)
      setApiData(newApiData)

      const newMediaFiles = newApiData.map((apiData) =>
        mapApiToMediaProps(apiData, mediaType)
      )
      setMediaFiles(newMediaFiles)

      const newFileIdMapping = Object.fromEntries(
        newApiData.map((hit) => [hit._source.id, hit._source.file_name])
      )
      setFileIdMapping(newFileIdMapping)

      setIsInitialized(true)
    }
  }, [
    data,
    isInitialized,
    setApiData,
    setMediaFiles,
    setFileIdMapping,
    mediaType,
  ])

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
          customInformationSection={
            <div className={styles.scrollableInfoSection}>
              <CustomInformationSection fileID={activeFile} />
            </div>
          }
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
            //This is the temporary toast as the actions are not integrated yet, Thats why No traslation is added
            toast({ message: 'Delete clicked', type: 'error' })
          },
        }}
        rightSection={[
          {
            type: 'buttonGroup',
            buttons: [
              {
                icon: 'download',
                onClick: () => setIsDownloadDrawerOpen(true),
              },
              {
                icon: 'layers',
                onClick: () =>
                  //This is the temporary toast as the actions are not integrated yet,, Thats why No traslation is added
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
              //This is the temporary toast as the actions are not integrated yet, Thats why No traslation is added
              toast({ message: 'Save clicked', type: 'success' })
            },
          },
        ]}
      />
      <DownloadWithVariants
        isOpen={isDownloadDrawerOpen}
        onClose={() => setIsDownloadDrawerOpen(false)}
        onDownload={(fileConfig: FileConfig) => {
          downloadVariants(fileConfig)
        }}
        variantsList={[mediaType] as TypesOfVariants[]}
      />
    </div>
  )
}
