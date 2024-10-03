export type FetchMatchifyProductsRequestType = {
  page: number
  sort_column?: string
  sort_direction?: string
  search?: string
  marketplace: string
  code: string
  activeTab?: boolean
  filters?: MatchFilterState
}

export type MatchFilterState = {
  lightbox: string[]
  categoryParentIds: string[]
}

export type FetchMatchifyProductsResponseType = {
  data: Product[]
  pagination: Pagination
}

export type Pagination = {
  count: number
  current_page: number
  first_page: boolean
  last_page: boolean
  total_pages: number
  next_page: number
}

export type Product = {
  listing_id: string
  asin: string
  master_product_id: string
  topic_id: string
  org_code: string
  sku: string
  market_product_id: string
  marketplace_name: string
  marketplace_code: string
  pim_updated_at: string
  backend_updated_at: null
  marketplace_updated_at: string
  comparison_date: string
  recorded_time: string
  title: string
  brand: string
  match_count: number
  created_at: string
  latest_record: boolean
  display_file: string
  parent_id: string
  match_score: number
  previous_day_match_score: number
  match_score_differece: number
  need_cases_fields: string[]
  need_publish_fields: string[]
  need_cases: boolean
  need_publish: boolean
  last_matched_date: string
  page_views_last_30_days: number
  product_cumulative_match_score: number
  last_action_taken_by: ActionTakenUser
}

export type ActionTakenUser = {
  action: string
  asin: string
  created_at: string
  id: string
  marketplace_code: string
  marketplace_name: string
  user_details: UserDetails
}

export type UserDetails = {
  first_name: string
  last_name: string
  user_id: string
}

export type SummaryResponseType = {
  issue_count: ObjectType
  need_publish_count: ObjectType
  need_cases_count: ObjectType
  portfolio_match_score: ObjectType
}

export type ObjectType = {
  display: string
  value: number
  type: string
  change: number
  comparison: number
  pct_change: string
}
