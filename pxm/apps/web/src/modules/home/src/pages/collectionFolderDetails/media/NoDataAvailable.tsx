import { useTranslate } from '@amplifi-workspace/web-shared'

const NoDataAvailable = () => {
  const { t } = useTranslate('portal')
  return (
    <div className='mt-72 text-center'>
      <div className='fs-16 fw-bold fc-dark-purple'>{t('noDataAvailable')}</div>
      <div className='fs-12 fc-purple'>
        {t('thereIsNoDataAvailableForThisCollectionFolder')}
      </div>
    </div>
  )
}

export default NoDataAvailable
