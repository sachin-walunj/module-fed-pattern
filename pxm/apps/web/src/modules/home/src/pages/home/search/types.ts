export type ConditionType =
  | 'is'
  | 'is-not'
  | 'starts-with'
  | 'does-not-start-with'
  | 'has-any-value'
  | 'is-empty'
  | 'is-not-empty'

export type SearchOptionType = 'exact' | 'keyword'
export interface SearchAttribute {
  id: string
  name: string
}
export interface SearchFilter {
  attribute?: SearchAttribute
  condition?: ConditionType
  value?: string
}
