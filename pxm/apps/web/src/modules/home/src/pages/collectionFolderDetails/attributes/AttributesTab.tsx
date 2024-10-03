import { AttributesContent } from './AttributesContent'
import { AttributesHeader } from './AttributesHeader'

export function AttributesTab({ id, search }: { id: string; search: string }) {
  return (
    <div>
      <div className='mb-16'>
        <AttributesHeader />
      </div>
      <AttributesContent id={id} />
    </div>
  )
}
