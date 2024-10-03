import { useCallback, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

import { TextInput } from '@patterninc/react-ui'

import { c, useTranslate } from '@amplifi-workspace/web-shared'

import { fetchUrlPreview } from '../../actions'

import styles from './add-new-link.module.scss'

interface AddNewLinkProps {
  linkState: {
    description: string
    title: string
    image: string
    link: string
  }
  updateLinkState: (newState: {
    description: string
    title: string
    image: string
    link: string
  }) => void
}

const isAbsoluteUrl = (url: string) =>
  // eslint-disable-next-line no-useless-escape
  /^(https?):\/\/[^\s/$.?#].[^\s]*$/i.test(url)
//function to check if the string has a valid protocal and ending

function AddNewLink({ linkState, updateLinkState }: AddNewLinkProps) {
  const [queryUrl, setQueryUrl] = useState<string>('')
  const [queryCounter, setQueryCounter] = useState(0)
  const { t } = useTranslate('portal')

  const [fieldValues, setFieldValues] = useState<{
    description: string
    title: string
    image: string
    link: string
  }>({
    description: '',
    title: '',
    image: '',
    link: '',
  })
  const fetchLinkPreview = useCallback(
    (link: string) => {
      if (isAbsoluteUrl(link)) {
        setFieldValues({
          ...fieldValues,
          link: link,
          description: '',
          title: '',
          image: '',
        })
        updateLinkState({ ...linkState, link: link })
        setQueryCounter((prev) => prev + 1)
        setQueryUrl(link)
      } else {
        setFieldValues({
          description: '',
          title: '',
          image: '',
          link: '',
        })
      }
    },
    [fieldValues, updateLinkState, linkState]
  )

  const { isFetching, isError } = useQuery({
    queryKey: ['fetchUrlPreview', queryUrl, queryCounter], // Include queryCounter as a part of queryKey
    queryFn: async () => {
      const response = await fetchUrlPreview(queryUrl)
      setFieldValues({
        ...fieldValues,
        description: response.description || '',
        title: response.title || '',
        image: response.image || '',
      })
      updateLinkState({
        ...linkState,
        description: response.description || '',
        title: response.title || '',
        image: response.image || '',
      })
      return response
    },
    enabled: !!queryUrl,
  })

  const handleLinkChange = (value: string) => {
    fetchLinkPreview(value)
  }

  function renderPreview() {
    const { description, title, image } = fieldValues

    if (isFetching) {
      return <p>{t('requesting')}</p>
    }

    if (isError) {
      return <p>{t('couldNotLoadThePreview')}</p>
    }

    if (title === '') {
      return (
        <p>{t('aThumbnailPreviewWillBeGeneratedOnceYouHaveEnteredALink')}</p>
      )
    }

    return (
      <div className='bdr bdrr-8 bdrc-gray p-20'>
        <div className={styles.resourceLinkCardImageWrapper}>
          <img
            className={styles.resourceLinkCardImage}
            src={image || `/images/no-img.svg`}
            alt={image || c('noImage')}
          />
        </div>
        <div className={styles.resourceLinkCardContent}>
          <p className='fs-16 mb-8 mt-8'>{title}</p>
          <Link
            href={fieldValues.link}
            className={`fc-blue ${styles.resourceLinkCardLink}`}
          >
            {fieldValues.link}
          </Link>
          <p className='fc-gray fs-14 mt-8'>{description}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <TextInput
        callout={(_, value) => handleLinkChange(value.toString())}
        id='newLink'
        labelText={t('link')}
        type='text'
        value={fieldValues.link}
        required
        debounce={500}
      />

      <div className='mt-16 mb-24'>
        <TextInput
          callout={(_, value) => {
            updateLinkState({ ...linkState, title: value.toString() })
          }}
          id='newDescription'
          labelText={t('description')}
          type='text'
          value={fieldValues.title}
          required
        />
      </div>
      {renderPreview()}
    </>
  )
}

export default AddNewLink
