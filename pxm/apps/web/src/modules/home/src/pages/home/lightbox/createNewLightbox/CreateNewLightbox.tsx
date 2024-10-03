'use client'
import { useEffect, useMemo, useState } from 'react'

import { Checkbox, TextInput, Toggle } from '@patterninc/react-ui'

import { useTranslate } from '@amplifi-workspace/web-shared'

import { CreateNewLightboxProps } from '../../../../_common/types/lightboxTypes'

import styles from './create-new-lightbox.module.scss'

const defaultRoles = [
  { id: 'superadmin', name: 'Super Admin' },
  { id: 'admin', name: 'Admin' },
  { id: 'contributor', name: 'Contributor' },
  { id: 'gpuser', name: 'General Plus User' },
  { id: 'guser', name: 'General User' },
]

const CreateNewLightbox: React.FC<CreateNewLightboxProps> = ({
  updateLigthboxState,
  lightboxState,
}) => {
  const [isViewSectionVisible, setIsViewSectionVisible] = useState(false)
  const [isEditSectionVisible, setIsEditSectionVisible] = useState(false)
  const { t } = useTranslate('portal')

  const defaultRolesToSelect = useMemo(() => ['superadmin', 'admin'], [])

  useEffect(() => {
    if (isViewSectionVisible) {
      const rolesToAdd = defaultRolesToSelect.filter(
        (role) => !lightboxState.checkedViewItems.includes(role)
      )
      updateLigthboxState({
        itemsType: 'checkedViewItems',
        roles: rolesToAdd,
        isRolesAdd: true,
      })
    }
  }, [
    defaultRolesToSelect,
    isViewSectionVisible,
    lightboxState.checkedViewItems,
    updateLigthboxState,
  ])

  useEffect(() => {
    if (isEditSectionVisible) {
      updateLigthboxState({
        itemsType: 'checkedEditItems',
        roles: defaultRolesToSelect,
        isRolesAdd: true,
      })
    } else {
      updateLigthboxState({
        itemsType: 'checkedEditItems',
        isFlushOut: true,
      })
    }
  }, [defaultRolesToSelect, isEditSectionVisible, updateLigthboxState])

  useEffect(() => {
    if (!isViewSectionVisible && !isEditSectionVisible) {
      updateLigthboxState({
        itemsType: 'checkedViewItems',
        isFlushOut: true,
      })
    }
  }, [isViewSectionVisible, isEditSectionVisible, updateLigthboxState])

  const handleViewCheckboxChange = () => {
    setIsViewSectionVisible(!isViewSectionVisible)
    if (isViewSectionVisible) {
      setIsEditSectionVisible(false)
    }
  }

  const handleEditCheckboxChange = () => {
    setIsEditSectionVisible(!isEditSectionVisible)
    if (!isViewSectionVisible) {
      setIsViewSectionVisible(!isViewSectionVisible)
    }
  }

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
    <div className={styles.outerContainer}>
      <div>
        <TextInput
          callout={(_, value) => {
            updateLigthboxState({
              isName: true,
              lightboxName: value.toString(),
            })
          }}
          debounce={1000}
          id='newLightboxName'
          labelText={t('lightboxName')}
          type='text'
          value={lightboxState.lightboxName}
          required
        />
      </div>
      <div className={styles.toggleContainer}>
        <Toggle
          checked={isViewSectionVisible}
          formLabelProps={{
            label: t('otherUsersCanView'),
          }}
          callout={handleViewCheckboxChange}
          className={styles.toggleButton}
        />
        {isViewSectionVisible && (
          <>
            {defaultRoles.map((role) => {
              const isRoleDisabled =
                isViewSectionVisible && defaultRolesToSelect.includes(role.id)
              const isRoleInEdit = lightboxState.checkedEditItems.includes(
                role.id
              )
              return (
                <Checkbox
                  label={role.name}
                  name={role.name}
                  callout={(_, value) =>
                    handleCheckboxChange(role.id, value, true)
                  }
                  checked={lightboxState.checkedViewItems.includes(role.id)}
                  disabled={isRoleDisabled || isRoleInEdit}
                  customClass={styles.userRoles}
                />
              )
            })}
          </>
        )}
        <Toggle
          checked={isEditSectionVisible}
          formLabelProps={{
            label: t('otherUsersCanEdit'),
          }}
          callout={handleEditCheckboxChange}
          className={styles.toggleButton}
        />
        {isEditSectionVisible && (
          <>
            {defaultRoles.map((item) => {
              const isRoleDisabled =
                isEditSectionVisible && defaultRolesToSelect.includes(item.id)
              return (
                <Checkbox
                  label={item.name}
                  name={item.name}
                  callout={(_, value) =>
                    handleCheckboxChange(item.id, value, false)
                  }
                  checked={lightboxState.checkedEditItems.includes(item.id)}
                  disabled={isRoleDisabled}
                  customClass={styles.userRoles}
                />
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

export default CreateNewLightbox
