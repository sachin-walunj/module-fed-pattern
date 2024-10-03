'use client'

import {
  Button,
  ButtonGroup,
  Icon,
  InformationPane,
  PageHeader,
} from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import styles from './product-details.module.scss'

export function ProductMatch() {
  const { t } = useTranslate('portal')

  // Will remove hard-coding after API integration

  const renderInformationPane = () => (
    <div>
      <InformationPane
        simple={{
          identifier: 'B0P477ABD2',
          product: {
            name: '',
            url: 'https://www.amazon.com',
          },
        }}
        header={{
          labelAndData: {
            check: true,
            data: 'B0P477ABD2',
            label: t('collectionFolderUpperCase'),
          },
          tag: {
            children: t('parent'),
            color: 'green',
          },
        }}
      >
        <InformationPane.ImageAndName
          imgUrl={`https://cdn.amplifi.pattern.com/93b2818b-401f-4bda-a2e9-164d5f0a3e3e_thumb.png`}
          product={{
            name: 'weBoost Office 200 - Model 472047 - 50 Ohms - Cell Signal Booster for Businesses',
          }}
        />
        <InformationPane.Divider />

        <>
          <div>
            <div className={styles.productDescription}>
              {t('productDescription')}
            </div>
            <p className={styles.descriptionText}>
              {
                "Elevate your office's connectivity with weBoost's premier cell booster, designed to turn your business building into a hub of communication. Elevate your office's connectivity with weBoost's premier cell booster, designed to turn your business building into a hub of communication. Elevate your office's connectivity with weBoost's premier cell booster, designed to turn your business building into a hub of communication."
              }
            </p>
          </div>
          <InformationPane.Divider />
        </>

        <div className={`flex justify-content-center my-16`}>
          <ButtonGroup
            buttons={[
              {
                icon: 'download',
                onClick: () => null,
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
    </div>
  )

  return (
    <div className='flex gap-16'>
      <div>{renderInformationPane()}</div>
      <div className='full-width'>
        <PageHeader
          leftSectionChildren={
            <div className='flex gap-16'>
              <Icon icon='errorWarning' size='32px' customClass='svg-red' />
              <div className='flex flex-direction-column'>
                <span className='fs-14 fw-bold'>
                  {`4 attributes in PXM and Seller Central don't match what's live
                  on Amazon`}
                </span>
                <span className='fs-14'>
                  {`Last check for match issues: Sep 23, 2024 at 12:30 p.m`}
                </span>
              </div>
            </div>
          }
          rightSectionChildren={
            <Button
              as='button'
              children={'Request to open case'.toLocaleUpperCase()}
            />
          }
        />
      </div>
    </div>
  )
}

export default ProductMatch
