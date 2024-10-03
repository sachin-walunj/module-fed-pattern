import type { Meta, StoryObj } from '@storybook/react'

import { useState } from 'react'

import {
  CollectionCard,
  CollectionCardProps,
  CollectionCardType,
} from './CollectionCard'
import { Collection } from '../../types/collectionTypes'

const meta: Meta<typeof CollectionCard> = {
  title: 'Components/CollectionCard',
  component: CollectionCard,
}

export default meta

type Story = StoryObj<typeof CollectionCard>

const CollectionCardWrapper = (args: Partial<CollectionCardProps>) => {
  const [checked, setChecked] = useState(false)

  return (
    <CollectionCard
      card={
        {
          id: '1',
          name: 'Product Name',
          type: 'topic',
          attributes: {
            value_text: [
              {
                id: '1',
                label: 'main_image_url',
                value:
                  'https://m.media-amazon.com/images/I/41Jd5FzxAkL.SL500.jpg',
              },
            ],
          } as Collection['attributes'],
          checked: checked,
        } as CollectionCardType
      }
      onCheckCallout={(name, checked) => {
        setChecked(checked)
      }}
      tags={[{ children: 'Variant', color: 'blue' }]}
      {...args}
    />
  )
}

const Template: Story = {
  render: (args) => <CollectionCardWrapper {...args} />,
}

export const Default: Story = {
  ...Template,
}
