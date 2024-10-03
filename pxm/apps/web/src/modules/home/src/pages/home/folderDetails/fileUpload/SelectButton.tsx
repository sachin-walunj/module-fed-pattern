import { Button, Icon } from '@patterninc/react-ui'

type SelectButtonProps = {
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
  hasValue: boolean
}

export const SelectButton: React.FC<SelectButtonProps> = ({
  onClick,
  children,
  disabled = false,
  hasValue,
}) => {
  return (
    <div
      className={`${disabled ? 'bgc-faint-gray' : ''} bdr bdrr-4 bdrc-${
        disabled ? 'light-gray' : 'medium-purple'
      } p-8 fs-12 fc-${
        disabled ? 'medium-gray' : hasValue ? 'dark-purple' : 'purple'
      } flex justify-content-between`}
    >
      <Button disabled={disabled} as='unstyled' onClick={onClick}>
        {children}
      </Button>
      <Icon
        icon='carat'
        size='12px'
        customClass={disabled ? 'svg-medium-gray' : 'svg-purple'}
      />
    </div>
  )
}
