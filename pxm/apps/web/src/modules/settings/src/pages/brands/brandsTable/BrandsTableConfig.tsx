import Link from 'next/link'

import {
  ButtonGroup,
  ConfigItemType,
  Image,
  MdashCheck,
  SortByProps,
} from '@patterninc/react-ui'

import { c, t } from '@amplifi-workspace/web-shared'

import { errorToast } from '../../../_common/functions/errorToast'
import { deleteBrand } from '../actions'
import { Brand } from '../types'

import styles from './brands-table.module.scss'

type BrandsTableConfig = {
  sortBy: SortByProps
}

export const brandsTableConfig = ({
  sortBy,
}: BrandsTableConfig): ConfigItemType<Brand, Record<string, unknown>>[] => [
  {
    name: 'name',
    label: t('settings:brandName'),
    cell: {
      children: (data) => (
        <span className={`${sortBy.prop === 'name' ? 'fw-semi-bold' : ''}`}>
          {data.name}
        </span>
      ),
    },
    mainColumn: true,
  },
  {
    name: 'logo',
    label: t('settings:logo'),
    noSort: true,
    cell: {
      children: (data) => (
        <MdashCheck check={!!data.logo}>
          <Image url={data.logo} containerClass={styles.brandLogo} />
        </MdashCheck>
      ),
    },
  },
  {
    name: 'description',
    label: t('settings:description'),
    cell: {
      children: (data) => (
        <MdashCheck
          check={!!data.description}
          customClass={`${sortBy.prop === 'description' ? 'fw-semi-bold' : ''}`}
        >
          {data.description}
        </MdashCheck>
      ),
    },
  },
  {
    name: '',
    label: '',
    isButton: true,
    noSort: true,
    cell: {
      children: (data) => {
        const onDelete = () => {
          try {
            deleteBrand(data.id)
          } catch (error) {
            errorToast(t('settings:errorDeletingBrand'))
          }
        }

        return (
          <ButtonGroup
            buttons={[
              {
                actions: [
                  {
                    text: c('delete'),
                    icon: 'trash',
                    destructive: true,
                    confirmation: {
                      type: 'red',
                      header: t('settings:deleteBrand'),
                      body: t('settings:deleteBrandConfirmation'),
                      confirmCallout: () => onDelete(),
                    },
                  },
                ],
              },
              {
                children: c('details'),
                as: 'link',
                href: `${process.env.ROUTE_PREFIX_V3}/settings/brands/${data.id}`,
                routerComponent: Link,
              },
            ]}
          />
        )
      },
    },
  },
]
