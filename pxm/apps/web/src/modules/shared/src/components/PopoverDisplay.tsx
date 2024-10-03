'use client'
import { useState } from 'react'

import { Button, Icon, Popover, SelectDisplay } from '@patterninc/react-ui'

type SelectDisplayOption = {
  name: string
  label: string
}

interface SelectPopoverProps {
  options: SelectDisplayOption[]
  onOptionClick: (option: SelectDisplayOption) => void
  initialSelectedOption?: string
}

export const PopoverDisplay: React.FC<SelectPopoverProps> = ({
  options,
  onOptionClick,
  initialSelectedOption = options[0].name,
}) => {
  const [selectedOption, setSelectedOption] = useState(initialSelectedOption)

  const handleOptionClick = (option: SelectDisplayOption) => {
    setSelectedOption(option.name)
    onOptionClick(option)
  }

  return (
    <Popover
      noPadding
      popoverContent={
        <SelectDisplay options={options} callout={handleOptionClick} />
      }
      tippyProps={{
        placement: 'bottom',
      }}
      children={({ setVisible, visible, tippyRef }) => (
        <Button onClick={() => setVisible(!visible)} ref={tippyRef}>
          <div className='flex gap-4 fc-purple'>
            <Icon
              icon={'carat'}
              size='12px'
              customClass='svg-medium-gray'
            ></Icon>
            {selectedOption}
          </div>
        </Button>
      )}
    />
  )
}
