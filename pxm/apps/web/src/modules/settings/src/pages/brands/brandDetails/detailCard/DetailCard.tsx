'use client'

import { Button, Icon } from '@patterninc/react-ui'

import { c } from '@amplifi-workspace/web-shared'

type DetailCardBaseProps = {
  title: string
  children: React.ReactNode
}

type DetailCardEdit = DetailCardBaseProps & {
  isEdit: boolean
  editCallout: () => void
}

type DetailCardEmpty = DetailCardBaseProps & {
  isEdit?: never
  editCallout?: never
}

type DetailCardProps = DetailCardEdit | DetailCardEmpty

export function DetailCard({
  title,
  children,
  isEdit,
  editCallout,
}: DetailCardProps) {
  return (
    <div className='bdr bdrc-medium-purple bdrr-8 p-24'>
      <div
        className={`flex gap-16 ${
          isEdit ? 'justify-content-between' : 'justify-content-start'
        }`}
      >
        <span className='fs-16 fw-semibold'>{title}</span>
        {isEdit ? (
          <Button styleType='secondary' onClick={editCallout}>
            <div className='flex gap-8 align-items-center'>
              <Icon icon='pencil' size='16px' />
              <span>{c('edit')}</span>
            </div>
          </Button>
        ) : null}
      </div>
      {children}
    </div>
  )
}
