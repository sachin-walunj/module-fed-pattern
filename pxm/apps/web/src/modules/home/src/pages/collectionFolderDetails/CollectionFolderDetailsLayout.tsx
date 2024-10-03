'use client'

import { useCallback, useContext, useEffect, useState } from 'react'

import { usePathname } from 'next/navigation'

import {
  BreadcrumbType,
  ButtonGroup,
  InformationPane,
  useMediaQuery,
} from '@patterninc/react-ui'

import { RootState, useAppSelector } from '@amplifi-workspace/store'
import {
  BreadcrumbContext,
  c,
  useQueryState,
  useRouterTabs,
  useTranslate,
} from '@amplifi-workspace/web-shared'

import { DownloadWithVariants } from '../../_common/components/DownloadWithVariants'
import { Topic } from '../../_common/types/collectionTypes'
import { FileConfig } from '../../_common/types/downloadVariantTypes'
import { GenerateDownload } from '../../_common/utils/download'
import { ROOT_LEVEL_BREADCRUMBS } from '../home/home'

import styles from './collection-folder-details-layout.module.scss'

export function CollectionFolderDetailsLayout({
  topicData,
  children,
}: {
  topicData: Topic
  children: JSX.Element
}) {
  const user = useAppSelector((state) => state.user)
  const { t } = useTranslate('portal')
  // state to store the product description
  const [productDescription, setProductDescription] = useState<string>('')
  const [isDownloadDrawerOpen, setIsDownloadDrawerOpen] =
    useState<boolean>(false)
  const downloadFiles = GenerateDownload()
  const isMobileView = useMediaQuery({ type: 'max', breakpoint: 'sm' })
  const isTabView = useMediaQuery({ type: 'max', breakpoint: 'md' })
  // getting the hero attribute from the store
  const heroAttribute = useAppSelector(
    (state: RootState) => state.config?.hero_attribute
  )

  const routerConfig = [
    {
      label: c('attributes'),
      link: '/attributes',
    },
    {
      label: c('media'),
      link: '/media',
      subrows: [
        {
          label: c('images'),
          link: '/images',
        },
        {
          label: c('imageStack'),
          link: '/image-stack',
        },
        {
          label: c('videos'),
          link: '/videos',
        },
        {
          label: c('docs'),
          link: '/docs',
        },
        {
          label: c('links'),
          link: '/links',
        },
        {
          label: c('misc'),
          link: '/misc',
        },
      ],
    },
    {
      label: c('relationships'),
      link: '/relationships',
      subrows: [
        {
          label: c('variants'),
          link: '/variants',
        },
        {
          label: c('listings'),
          link: '/listings',
        },
        {
          label: c('related'),
          link: '/related',
        },
      ],
    },
  ]
  const { updateBreadcrumbs } = useContext(BreadcrumbContext)
  const currentPath = usePathname()
  // Check if the current path includes '/images/', '/videos/', '/links/' or '/misc'
  const [activeFile] = useQueryState<string | undefined>({
    key: 'activeFile',
  })
  const updateBreadcrumbsOnDetailsLayout = useCallback(() => {
    if (
      topicData.hierarchy &&
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
        newBreadcrumbs.push({
          name: topicData.name,
          link: currentPath,
          changeType: 'tab',
        })
      }

      updateBreadcrumbs(newBreadcrumbs)
    }
  }, [topicData, currentPath, updateBreadcrumbs])

  useEffect(() => {
    updateBreadcrumbsOnDetailsLayout()
  }, [updateBreadcrumbs])

  const routerTabs = useRouterTabs({ routerConfig })

  // getting the description of the hero attribute
  const getHeroAttrDescription = useCallback(() => {
    const description = topicData?.attributes?.filter(
      (attr) =>
        attr?.label === heroAttribute?.label && attr?.value_type === 'Text'
    )[0]?.value
    return typeof description === 'string' ? description : ''
  }, [topicData, heroAttribute?.label])

  const downloadVariants = (fileConfig: FileConfig) => {
    const payload = {
      entities: [
        {
          name: topicData.name,
          id: topicData.id,
          type: 'topic',
        },
      ],
      file_config: fileConfig,
      entity_type: 'topic',
      role: user?.role,
      region: user?.regions.map((region) => region.id),
      wait: false,
    }

    // Make the API call here the /file/compress
    downloadFiles(payload)

    setIsDownloadDrawerOpen(false)
  }

  useEffect(() => {
    const heroDescription = getHeroAttrDescription()
    setProductDescription(heroDescription ?? '')
  }, [topicData, getHeroAttrDescription])

  const renderInformationPane = () => (
    <div className={isMobileView ? 'flex' : ''}>
      <InformationPane
        simple={{
          identifier: 'B0P477ABD2',
          imgUrl: `${process.env.CLIENT_CDN_ENDPOINT}/${topicData?.display_file}_thumb.png`,
          product: {
            name: topicData?.additional_title,
            url: 'https://www.amazon.com',
          },
        }}
        header={{
          labelAndData: {
            check: true,
            data: topicData?.name,
            label: t('collectionFolderUpperCase'),
          },
          tag: {
            children: t('parent'),
            color: 'green',
          },
        }}
      >
        <InformationPane.ImageAndName
          imgUrl={`${process.env.CLIENT_CDN_ENDPOINT}/${topicData?.display_file}_thumb.png`}
          product={{
            name: topicData?.additional_title,
            url: 'https://www.amazon.com',
          }}
        />
        <InformationPane.Divider />
        {productDescription && (
          <>
            <div>
              <div className={styles.productDescription}>
                {t('productDescription')}
              </div>
              <p className={styles.descriptionText}>{productDescription}</p>
            </div>
            <InformationPane.Divider />
          </>
        )}
        <div
          className={`flex justify-content-center my-16 ${
            isTabView ? '' : styles.actions
          }`}
        >
          <ButtonGroup
            buttons={[
              {
                icon: 'download',
                onClick: () => setIsDownloadDrawerOpen(true),
              },
              {
                icon: 'layers',
                onClick: () => null,
              },
              {
                icon: 'share1',
                onClick: () => null,
              },
            ]}
          />
        </div>
      </InformationPane>
      {isMobileView && (
        <ButtonGroup
          buttons={[
            {
              icon: 'layers',
              onClick: () => null,
            },
            {
              icon: 'share1',
              onClick: () => null,
            },
          ]}
        />
      )}
    </div>
  )

  return (
    <div>
      <div className={styles.productDetailsPage}>
        {!activeFile && renderInformationPane()}
        <div className={isTabView ? 'mt-16' : ''}>
          {!activeFile && routerTabs}
          {children}
        </div>
      </div>
      <DownloadWithVariants
        isOpen={isDownloadDrawerOpen}
        onClose={() => setIsDownloadDrawerOpen(false)}
        onDownload={(file_config: FileConfig) => downloadVariants(file_config)}
        variantsList={['image', 'video', 'misc', 'document']}
      />
    </div>
  )
}
