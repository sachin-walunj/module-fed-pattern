'use client'

import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { useIsMobileView } from '@patterninc/react-ui'

import {
  AppDispatch,
  setFeaturedFolders,
  useAppDispatch,
  useAppSelector,
} from '@amplifi-workspace/store'
import { useTranslate } from '@amplifi-workspace/web-shared'

import { getFeaturedFolders } from './action'
import FeatureCard from '../featureCard/FeatureCard'

import style from './feature-card-container.module.scss'

const FeatureCardContainer: React.FC = () => {
  const dispatch: AppDispatch = useAppDispatch()
  const [isFeaturedFoldersFetched, setIsFeaturedFoldersFetched] =
    useState(false)

  const { t } = useTranslate('portal')
  const user = useAppSelector((state) => state.user)

  const regions = user?.regions.map((region) => region.id)

  const { data } = useQuery({
    queryKey: ['getFeaturedFolders', regions, user.role],
    queryFn: () =>
      getFeaturedFolders({
        filter: { terms: { region: regions } },
        isLandingPage: true,
        region: regions,
        roles: user.role,
      }),
    enabled: !!isFeaturedFoldersFetched,
  })

  useEffect(() => {
    if (data?.hits.length) {
      setIsFeaturedFoldersFetched(false)
      dispatch(
        setFeaturedFolders({
          hits: data.hits,
          max_score: data.max_score,
          total: data.total,
        })
      )
    } else {
      setIsFeaturedFoldersFetched(true)
    }
  }, [data, dispatch, regions, user.role])

  return (
    <>
      {useIsMobileView() && (
        <h2 className='text-center'>{t('featuredFolder')}</h2>
      )}
      <section className={style.cardCaintainer}>
        {data?.hits.map((feature) => (
          <FeatureCard
            key={feature._id}
            id={feature._id}
            _source={feature._source}
          />
        ))}
      </section>
    </>
  )
}

export default FeatureCardContainer
