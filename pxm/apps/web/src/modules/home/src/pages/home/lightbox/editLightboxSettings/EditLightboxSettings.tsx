'use client'
import { Checkbox, CustomTable } from '@patterninc/react-ui'

import { c } from '@amplifi-workspace/web-shared'

import { EditLightboxSettingsProps } from '../../../../_common/types/lightboxTypes'

import style from './edit-lightbox-settings.module.scss'

const defaultRoles = [
  { id: 'superadmin', name: 'Super Admin' },
  { id: 'admin', name: 'Admin' },
  { id: 'contributor', name: 'Contributor' },
  { id: 'gpuser', name: 'General Plus User' },
  { id: 'guser', name: 'General User' },
]

const EditLightboxSetttings: React.FC<EditLightboxSettingsProps> = ({
  updateLigthboxState,
  lightboxState,
}) => {
  const defaultRolesToSelect = ['superadmin', 'admin']

  const handleCheckboxChange = (
    id: string,
    value: boolean,
    isView: boolean
  ) => {
    const type = isView ? 'checkedViewItems' : 'checkedEditItems'
    const index = defaultRoles.findIndex((role) => role.id === id)

    if (value) {
      const rolesAbove = defaultRoles.slice(0, index + 1).map((role) => role.id)

      updateLigthboxState({
        itemsType: type,
        roles: rolesAbove,
        isRolesAdd: true,
      })
      if (type === 'checkedEditItems') {
        updateLigthboxState({
          itemsType: 'checkedViewItems',
          roles: rolesAbove,
          isRolesAdd: true,
        })
      }
    } else {
      const rolesToUncheck = defaultRoles.slice(index).map((role) => role.id)

      updateLigthboxState({
        itemsType: type,
        roles: rolesToUncheck,
        isRolesAdd: false,
      })
    }
  }

  return (
    <CustomTable
      hasData
      successStatus
      hasMore={false}
      loading={false}
      tableId=''
      noDataFields={{
        primaryText: '',
        secondaryText: '',
      }}
      sort={() => null}
      sortBy={{ prop: '', flip: false }}
      getData={() => {
        return
      }}
      customWidth='100%'
      headers={[
        {
          name: 'roles',
          label: c('roles'),
          noSort: true,
          style: { paddingBottom: '10px' },
        },
        {
          name: 'view',
          label: c('view'),

          noSort: true,
          style: { paddingBottom: '10px', paddingRight: '50px' },
        },
        {
          name: 'edit',
          label: c('edit'),

          noSort: true,
          style: { paddingBottom: '10px', paddingRight: '50px' },
        },
      ]}
      children={defaultRoles.map((item, index) => {
        const isRoleDisabled = defaultRolesToSelect.includes(item.id)
        const isRoleInEdit = lightboxState?.checkedEditItems?.includes(item.id)
        return (
          <tr key={item.id} className={style.tr}>
            <td className='fs-14 p-10'>{item.name}</td>

            <td className='pl-24'>
              <Checkbox
                hideLabel
                label=''
                name={item.name}
                callout={(_, value) =>
                  handleCheckboxChange(item.id, value, true)
                }
                checked={lightboxState?.checkedViewItems?.includes(item.id)}
                disabled={isRoleDisabled || isRoleInEdit}
              />
            </td>

            <td className='pl-16'>
              <Checkbox
                hideLabel
                label={''}
                name={item.name}
                callout={(_, value) =>
                  handleCheckboxChange(item.id, value, false)
                }
                checked={lightboxState?.checkedEditItems?.includes(item.id)}
                disabled={isRoleDisabled}
              />
            </td>
          </tr>
        )
      })}
    />
  )
}

export default EditLightboxSetttings
