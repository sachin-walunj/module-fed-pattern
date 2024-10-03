import { useMemo } from 'react'

import { Button, Icon, NewSelect, TextInput } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import { SearchAttributeSelect } from './SearchAttributeSelect'
import { ConditionType, SearchFilter } from './types'

import styles from './search.module.scss'

interface SearchFilterSelectProps {
  value: SearchFilter[]
  callout: (value: SearchFilter[]) => void
}
export const SearchFilterSelect: React.FC<SearchFilterSelectProps> = ({
  value,
  callout,
}) => {
  const { t } = useTranslate('portal')
  const onAttributeChange = (newItem: SearchFilter, index: number): void => {
    const copy = value.slice()
    copy[index] = newItem
    callout(copy)
  }

  const onAdd = (): void => {
    const copy = value.slice()
    const newItem: SearchFilter = {}

    copy.push(newItem)
    callout(copy)
  }

  const onRemove = (index: number): void => {
    const copy = value.slice()
    copy.splice(index, 1)
    callout(copy)
  }

  const isAddSearchFilterDisabled =
    value.length > 0 && value[value.length - 1]?.attribute?.id === undefined
  return (
    <>
      {value.map((item, i) => (
        <SearchFilterItem
          key={item.attribute?.id || i}
          value={item}
          callout={(newItem) => onAttributeChange(newItem, i)}
          onRemove={() => onRemove(i)}
        />
      ))}
      <div className={styles.addAttributeContainer}>
        <Button
          className={styles.addAttributeButton}
          onClick={onAdd}
          disabled={isAddSearchFilterDisabled}
        >
          <Icon icon='plus' /> {t('addAnotherSearchFilter')}
        </Button>
      </div>
    </>
  )
}

interface SearchFilterItemProps {
  value: SearchFilter
  callout: (value: SearchFilter) => void
  onRemove?: () => void
}
const SearchFilterItem: React.FC<SearchFilterItemProps> = ({
  value,
  callout,
  onRemove,
}) => {
  const { t } = useTranslate('portal')

  const onChange = <KEY extends keyof SearchFilter>(
    key: KEY,
    newValue: SearchFilter[KEY]
  ): void => {
    const copy = { ...value }
    copy[key] = newValue

    callout(copy)
  }

  interface ConditionObject {
    id: ConditionType
    name: string
  }
  const conditionOptions: ConditionObject[] = useMemo(
    () => [
      {
        id: 'is',
        name: t('is'),
      },
      {
        id: 'is-not',
        name: t('isNot'),
      },
      {
        id: 'starts-with',
        name: t('startsWith'),
      },
      {
        id: 'does-not-start-with',
        name: t('doesNotStartWith'),
      },
      {
        id: 'has-any-value',
        name: t('hasAnyValue'),
      },
      {
        id: 'is-empty',
        name: t('isEmpty'),
      },
      {
        id: 'is-not-empty',
        name: t('isNotEmpty'),
      },
    ],
    [t]
  )

  const selectedConditionOption = useMemo(
    () =>
      conditionOptions.find((option) => option.id === value.condition) ||
      conditionOptions[0],
    [value.condition, conditionOptions]
  )

  return (
    <div className={styles.searchAttributeContainer}>
      <SearchAttributeSelect
        value={value.attribute}
        callout={(value) => onChange('attribute', value)}
      />
      <NewSelect
        labelProps={{
          label: t('condition'),
        }}
        required
        options={conditionOptions}
        optionKeyName='id'
        labelKeyName='name'
        selectedItem={selectedConditionOption}
        onChange={(value) => onChange('condition', value.id)}
      />
      <TextInput
        value={value.value || ''}
        callout={(_, value) => onChange('value', String(value))}
        labelText={t('values')}
        placeholder={t('enterValues')}
      />
      {onRemove ? (
        <div className={styles.searchAttributeRemove}>
          <Button as='unstyled' onClick={onRemove}>
            <Icon icon='x' size='16px' customClass='svg-purple' />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
