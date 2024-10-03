'use client'
import { useMemo, useState } from 'react'

import { useInfiniteQuery } from '@tanstack/react-query'
import moment from 'moment'
import Link from 'next/link'

import {
  Button,
  ConfigItemType,
  hasValue,
  Mdash,
  MdashCheck,
  PercentageCheck,
  PrimaryTableCell,
  snakeCaseToTitle,
  SortColumnProps,
  StandardTable,
  Tippy,
} from '@patterninc/react-ui'

import { t } from '@amplifi-workspace/web-shared'

import { fetchMatchifyProducts } from './action'
import { Product } from './types'

type MatchTableProps = {
  searchTerm: string
  activeTab: string
  setAllTabCount: (count: number) => void
}

const MatchTable = ({
  searchTerm,
  activeTab,
  setAllTabCount,
}: MatchTableProps) => {
  const [sortBy, setSoryBy] = useState({ prop: 'title', flip: false })

  const productsQueryParams = useMemo(() => {
    return {
      limit: 20,
      marketplace: 'Amazon',
      code: 'US',
      sort_column: sortBy.prop ?? '',
      sort_direction: sortBy.flip ? 'asc' : 'desc',
      ...(searchTerm && { search: searchTerm }),
      ...(activeTab !== 'all' && { [activeTab]: true }),
    }
  }, [activeTab, searchTerm, sortBy.flip, sortBy.prop])

  const { data, isPending, fetchNextPage, status, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['products', productsQueryParams],
      queryFn: async ({ pageParam = 0 }) => {
        const response = await fetchMatchifyProducts({
          ...productsQueryParams,
          page: pageParam ?? 1,
        })

        if (activeTab === 'all') {
          setAllTabCount(response?.pagination?.count)
        }

        return response
      },
      initialPageParam: 1,
      getNextPageParam: (previousResponse) => {
        return previousResponse?.pagination?.last_page
          ? undefined
          : previousResponse?.pagination?.next_page
      },
    })

  const products = useMemo(
    () => data?.pages?.flatMap((page) => page.data),
    [data]
  )

  const sort: SortColumnProps['sorter'] = (sortObj) => {
    setSoryBy({ prop: sortObj.activeColumn, flip: sortObj.direction })
  }
  const hasData = useMemo(
    () => !!(status === 'success' && products?.length),
    [products?.length, status]
  )

  const config = useMemo(
    () => [
      {
        name: 'title',
        label: t('portal:matchProductCellLabel'),
        cell: {
          children: (productInfo: Product): React.ReactNode => (
            <PrimaryTableCell
              title={productInfo.title}
              titleProp='title'
              externalLink={`https://www.amazon.com/dp/${productInfo.asin}`}
              marketplaceNames={productInfo.marketplace_name}
              sortBy={sortBy}
              uniqId={{
                id: productInfo?.asin,
                idLabel: 'ASIN',
                idName: 'asin',
              }}
              imageProps={{
                alt: productInfo.asin,
                url: productInfo?.display_file
                  ? `https://cdn.amplifi.pattern.com/${productInfo.display_file}_thumb.png`
                  : '',
              }}
              soldBy={{ iserve: true }}
            />
          ),
        },
        mainColumn: true,
      },
      {
        name: 'match_scrore',
        label: t('portal:matchScoreCellLabel'),
        cell: {
          children: (productInfo: Product) => (
            <MdashCheck check={!!productInfo.match_score}>
              <PercentageCheck
                percent={productInfo.match_score}
                decimalScale={2}
              />
            </MdashCheck>
          ),
        },
        tooltip: {
          content: <span>{t('portal:matchScoreTooltip')}</span>,
        },
      },
      {
        name: 'page_views',
        label: t('portal:matchPageViewsCellLabel'),
        cell: {
          children: (productInfo: Product) => (
            <span>{productInfo.page_views_last_30_days}</span>
          ),
        },
        tooltip: {
          content: <span>{t('portal:matchPageViewsTooltip')}</span>,
        },
      },
      {
        name: 'days_unmatched',
        label: t('portal:matchDaysUnmatchedCellLabel'),
        cell: {
          children: (productInfo: Product) => {
            const daysDifference = moment().diff(
              moment(productInfo?.last_matched_date),
              'days'
            )
            const totalDaysUnmatched =
              daysDifference === 1
                ? `${daysDifference} day`
                : `${daysDifference} days`
            return <span>{totalDaysUnmatched}</span>
          },
        },
      },
      {
        name: 'issue_summmary',
        label: t('portal:matchIssueSummaryCellLabel'),
        cell: {
          children: (productInfo: Product) => {
            let issueSummary = []
            if (activeTab === 'all') {
              issueSummary = [
                ...new Set([
                  ...productInfo.need_cases_fields,
                  ...productInfo.need_publish_fields,
                ]),
              ]
            } else {
              issueSummary =
                activeTab === 'need_cases'
                  ? productInfo.need_cases_fields
                  : productInfo.need_publish_fields
            }

            const firstTwoIssueSummary = issueSummary.slice(0, 2)
            const remaininIssueSummary = issueSummary.slice(2)
            const remainingIssuesCount = issueSummary.length - 2

            return (
              <span>
                {firstTwoIssueSummary
                  .map((issue) => snakeCaseToTitle(issue))
                  .join(', ')}

                {remainingIssuesCount > 0 && (
                  <span className='remaininIssueSummary'>
                    <Tippy
                      placement={'bottom-end'}
                      className='no-padding'
                      maxWidth='300px'
                      content={
                        <div className='p-16'>
                          <p className='fw-bold m-0 pb-8'>Issue Summary</p>
                          {remaininIssueSummary?.map((item) => {
                            return (
                              <p key={item} className='m-0'>
                                {snakeCaseToTitle(item)}
                              </p>
                            )
                          })}
                        </div>
                      }
                      interactive
                    >
                      <span className={'ml-4 fw-semi-bold'}>
                        +{remainingIssuesCount} more
                      </span>
                    </Tippy>
                  </span>
                )}
              </span>
            )
          },
        },
      },
      {
        name: 'last_action',
        label: 'Last Action',
        cell: {
          children: (productInfo: Product) => (
            <div>
              <MdashCheck check={hasValue(productInfo.last_action_taken_by)}>
                <div className='fw-semi-bold'>
                  {productInfo.last_action_taken_by?.user_details?.first_name}{' '}
                  {productInfo.last_action_taken_by?.user_details?.last_name}
                </div>
                <div>
                  {productInfo.last_action_taken_by?.action} on{' '}
                  {productInfo.last_action_taken_by?.created_at ? (
                    moment(productInfo.last_action_taken_by.created_at).format(
                      'MMMM Do, YYYY'
                    )
                  ) : (
                    <Mdash />
                  )}
                </div>
              </MdashCheck>
            </div>
          ),
        },
      },
      {
        name: '',
        label: '',
        cell: {
          children: (productInfo: Product) => (
            <Link href={`/match/${productInfo.asin}`}>
              <Button styleType='primary-green'>Details</Button>
            </Link>
          ),
        },
        noSort: true,
        isButton: true,
      },
    ],
    [activeTab, sortBy]
  )

  return (
    <StandardTable
      tableId='match-table'
      dataKey='asin'
      loading={isPending}
      hasData={hasData}
      hasMore={!!(status === 'success' && hasNextPage)}
      successStatus={status === 'success'}
      data={products || []}
      getData={fetchNextPage}
      sortBy={sortBy}
      config={config as ConfigItemType<Product, Record<string, unknown>>[]}
      noDataFields={{
        primaryText: t('portal:noDataAvailable'),
        secondaryText: t('portal:noMatchProductsFound'),
      }}
      sort={sort}
    />
  )
}

export default MatchTable
