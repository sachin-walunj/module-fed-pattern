'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import moment from 'moment'

import {
  ButtonGroup,
  Checkbox,
  DatepickerNew,
  MultiSelect,
  NewSelect,
  PageFooter,
  SelectDisplay,
  StandardTable,
  TextInput,
  toast,
  Tooltip,
  trimText,
  useIsMobileView,
} from '@patterninc/react-ui'

import {
  Attribute,
  Menu,
  ObjectValue,
  RawOption,
  useAppSelector,
} from '@amplifi-workspace/store'
import { c, useTranslate } from '@amplifi-workspace/web-shared'

import {
  getAttributeGroups,
  GetAttributeGroupsResponse,
  updateTopic,
} from './actions'
import { AddExistingAttributesDrawer } from './AddExistingAttributes'
import { DownloadAttributesDrawer } from './DownloadAttributesDrawer'
import { exportAttributeDetails } from './exportAttributes'
import { Topic } from '../../../_common/types/collectionTypes'
import { getTopic } from '../actions'

import styles from './attributes-tab.module.scss'

export type ExtendedTopic = Omit<Topic, 'attributes'> & {
  attributes: Attribute[]
}

type AttributeValue = {
  attribute: string
  id: string
  value: string | boolean | ObjectValue[] | string[]
  options: RawOption[]
  value_type: 'Boolean' | 'Text' | 'Number' | 'Date' | 'List' | 'Pick List'
  maximum?: number
}

type InputValues = {
  [key: string]: string | boolean | ObjectValue[] | string[]
}

type PickListOption = {
  id: string
  label: string
}

export function AttributesContent({ id }: { id: string }) {
  const user = useAppSelector((state) => state.user)
  const queryClient = useQueryClient()
  const [inputValues, setInputValues] = useState<InputValues>({})

  const [isOpen, setIsOpen] = useState(false)
  const [editingAttributes, setEditingAttributes] = useState<string[]>([])
  const [attributesData, setAttributesData] = useState<Attribute[]>([])
  const [tableData, setTableData] = useState<AttributeValue[]>([])
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)
  const isMobileView = useIsMobileView()
  const [selectedAttributes, setSelectedAttributes] = useState<
    {
      name: string
      secondaryOption:
        | 'Boolean'
        | 'Text'
        | 'Number'
        | 'Date'
        | 'List'
        | 'Pick List'
      attribute?: Attribute
    }[]
  >([])
  const [excludedAttributes, setExcludedAttributes] = useState<
    { id?: string }[]
  >([])
  const [selectedDownloadAttGroups, setSelectedDownloadAttGroups] = useState<
    { name: string }[]
  >([])
  const [checkedStates, setCheckedStates] = useState<{
    [key: string]: boolean
  }>({})
  const [singlePickListOptions, setSinglePickListOptions] = useState<{
    [key: string]: PickListOption
  }>({})
  const [multiplePickListOptions, setMultiplePickListOptions] = useState<{
    [key: string]: PickListOption[]
  }>({})

  const { t } = useTranslate('portal')

  const { data: topicData } = useQuery({
    queryKey: ['getTopic', id],
    queryFn: () => getTopic(id),
    enabled: !!id,
  })

  const payload = useMemo(
    () => ({
      role: user?.role,
      regions: user?.regions ? user.regions.map((region) => region.id) : [],
    }),
    [user]
  )

  const {
    data: attributeGroupsData,
    refetch: refetchAttributeGroups,
    isLoading,
  } = useQuery<GetAttributeGroupsResponse>({
    queryKey: ['getAttributeGroups', id, payload],
    queryFn: () => getAttributeGroups(id, JSON.stringify(payload)),
    enabled: !!id && !!payload,
  })

  const getFirstAttributeGroupName = useCallback((): string => {
    return attributeGroupsData?.attribute_groups &&
      attributeGroupsData.attribute_groups.length > 0
      ? attributeGroupsData.attribute_groups[0].name
      : ''
  }, [attributeGroupsData])

  const [selectedAttGroup, setSelectedAttGroup] = useState<string>('')
  useEffect(() => {
    const firstGroupName = getFirstAttributeGroupName()
    if (firstGroupName && !selectedAttGroup) {
      setSelectedAttGroup(firstGroupName)
    }
  }, [getFirstAttributeGroupName, selectedAttGroup])
  const refreshTopicData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['getTopic', id] })
  }, [queryClient, id])

  const handleExcludedAttributes = useCallback((response: Topic) => {
    const attributes = response.tabs
      .reduce<Menu[]>(
        (acc, tab) => (tab.id === 'details' ? acc.concat(tab.menus) : acc),
        []
      )
      .reduce<string[]>((acc, menu) => acc.concat(menu.children || []), [])
      .map((id) => ({ id }))
    setExcludedAttributes(attributes)
  }, [])

  const updateTableData = useCallback(
    (attributes: Attribute[], selectedGroup?: string) => {
      const groupToUse = selectedGroup || selectedAttGroup
      const filteredAttributes =
        attributes?.filter((attr) => {
          const selectedGroup = attributeGroupsData?.attribute_groups?.find(
            (group) => group?.name === groupToUse
          )
          return selectedGroup
            ? attr?.group_id?.includes(selectedGroup?.id)
            : true
        }) ?? []

      setTableData(
        filteredAttributes.map((attr) => ({
          attribute: attr.label || '',
          options: attr.options,
          value: attr.value,
          value_type: attr.value_type,
          id: attr.id,
          maximum: attr.maximum,
        }))
      )
    },
    [attributeGroupsData, selectedAttGroup]
  )

  useEffect(() => {
    if (topicData && Array.isArray(topicData.attributes)) {
      setAttributesData(topicData.attributes)

      handleExcludedAttributes(topicData)
      updateTableData(topicData.attributes, selectedAttGroup)
    }
  }, [
    topicData,
    attributeGroupsData,
    updateTableData,
    handleExcludedAttributes,
    selectedAttGroup,
  ])

  const { mutate: updateTopicMutation, isPending } = useMutation<
    Topic,
    Error,
    ExtendedTopic
  >({
    mutationFn: (updatedData: ExtendedTopic) => updateTopic(updatedData),
    onSuccess: (data: Topic) => {
      setSinglePickListOptions({})
      setMultiplePickListOptions({})
      setAttributesData(data.attributes)
      updateTableData(data.attributes, selectedAttGroup)
      queryClient.invalidateQueries({ queryKey: ['getTopic', id] })
      refetchAttributeGroups()
    },
    onError: (error) => {
      toast({
        type: 'error',
        message: t('failedToUpdateAttributesPleaseTryAgain'),
      })
    },
  })

  const confirmDeleteAttribute = (attributeToDelete: AttributeValue) => {
    if (!topicData) return

    const updatedAttributes = attributesData.filter(
      (attr) => attr.id !== attributeToDelete.id
    )
    const updatedTopicData: ExtendedTopic = {
      ...topicData,
      attributes: updatedAttributes,
    }
    updateTopicMutation(updatedTopicData, {
      onSuccess: () => {
        toast({
          type: 'success',
          message: t('attributeDeletedSuccessfully', {
            attribute: attributeToDelete.attribute,
          }),
        })
      },
    })
  }

  const handleSaveAllAttributes = () => {
    if (!topicData) return
    const updatedAttributes = attributesData.map((attr) => {
      if (attr.label && editingAttributes.includes(attr.label)) {
        return {
          ...attr,
          value: inputValues[attr.label],
        }
      }
      return attr
    })

    const updatedTopicData: ExtendedTopic = {
      ...topicData,
      attributes: updatedAttributes as Attribute[],
    }

    updateTopicMutation(updatedTopicData, {
      onSuccess: () => {
        toast({
          type: 'success',
          message: t('multipleAttributesUpdatedSuccessfully'),
        })
      },
    })
    setEditingAttributes([])
  }

  const handleEditAttribute = (attribute: string) => {
    if (editingAttributes.includes(attribute)) {
      setEditingAttributes(
        editingAttributes.filter((attr) => attr !== attribute)
      )
    } else {
      setEditingAttributes([...editingAttributes, attribute])
      setInputValues((prevInputValues) => ({
        ...prevInputValues,
        [attribute]:
          tableData.find((item) => item.attribute === attribute)?.value || '',
      }))
    }
  }

  const handleSaveAttribute = (attribute: string) => {
    if (!topicData) return
    const updatedAttributes = attributesData.map((attr) => {
      if (attr.label === attribute) {
        return {
          ...attr,
          value: inputValues[attribute],
        }
      }
      return attr
    })

    const updatedTopicData: ExtendedTopic = {
      ...topicData,
      attributes: updatedAttributes as Attribute[],
    }

    updateTopicMutation(updatedTopicData, {
      onSuccess: () => {
        toast({
          type: 'success',
          message: t('attributeUpdatedSuccessfully', { attribute: attribute }),
        })
      },
    })
    setEditingAttributes(editingAttributes.filter((attr) => attr !== attribute))
  }

  const isObjectValueArray = (
    arr: string[] | ObjectValue[]
  ): arr is ObjectValue[] =>
    arr.length > 0 && arr.every((item) => typeof item === 'object')

  const handleInputChange = (
    attribute: string,
    value: string | boolean | ObjectValue[] | string[],
    optionId?: string
  ) => {
    setInputValues((prevInputValues) => {
      const currentValue = prevInputValues[attribute]
      if (
        Array.isArray(currentValue) &&
        isObjectValueArray(currentValue) &&
        optionId
      ) {
        // List type attribute
        return {
          ...prevInputValues,
          [attribute]: currentValue.map((item) => {
            if (item.id === optionId) {
              // Ensure correct type based on value_type
              if (item.value_type === 'Boolean') {
                return { ...item, value: Boolean(value) }
              } else {
                return { ...item, value: String(value) }
              }
            }
            return item
          }),
        }
      } else {
        // Non-List type attribute
        return {
          ...prevInputValues,
          [attribute]: value,
        }
      }
    })
  }

  const handleAttGroupClick = useCallback(
    (groupName: string) => {
      setSelectedAttGroup(groupName)
      if (topicData && Array.isArray(topicData.attributes)) {
        updateTableData(topicData.attributes, groupName)
      }
    },
    [topicData, updateTableData]
  )

  const handleDownloadDrawer = () => {
    setSelectedDownloadAttGroups([])
    setIsDownloadOpen(!isDownloadOpen)
  }

  const addAttributesDrawer = () => {
    setIsOpen(!isOpen)
    setSelectedAttributes([])
  }

  const setAttributeDefaultValue = (valueType: string) => {
    switch (valueType) {
      case 'Text':
        return ''
      case 'Number':
        return 0
      case 'Boolean':
        return false
      case 'Date':
        return new Date().toISOString()
      case 'Pick List':
        return new Array<string>()
    }
  }

  const handleSaveSelectedAttributes = async () => {
    if (!topicData) return

    // to ensure all selected attributes match the expected format
    const validSelectedAttributes = selectedAttributes
      .map((attr) => {
        if (attr.attribute) {
          // Set default value based on value_type
          let defaultValue
          if (attr.attribute.value_type === 'List') {
            defaultValue = attr.attribute.options.map((option) => {
              const { value_type: optionValueType = '' } = option
              const optionValue = setAttributeDefaultValue(optionValueType)
              return {
                ...option,
                value: optionValue,
              }
            })
          } else {
            defaultValue = setAttributeDefaultValue(attr.attribute.value_type)
          }
          return {
            ...attr.attribute,
            value: defaultValue,
          }
        }
        return null
      })
      .filter((attr): attr is Attribute => !!attr)

    const updatedAttributes = [...attributesData, ...validSelectedAttributes]

    const updatedTopicData: ExtendedTopic = {
      ...topicData,
      attributes: updatedAttributes,
    }

    updateTopicMutation(updatedTopicData, {
      onSuccess: (response) => {
        handleExcludedAttributes(response)
        toast({
          type: 'success',
          message: t('attributesAdded', { count: selectedAttributes.length }),
        })
        refetchAttributeGroups()
      },
    })

    // Close the drawer and clear selected attributes
    addAttributesDrawer()
    setSelectedAttributes([])
  }

  const handleDownload = () => {
    if (!topicData) return
    const menus = topicData.tabs.reduce<Menu[]>(
      (acc, tab) => (tab.id === 'details' ? acc.concat(tab.menus) : acc),
      []
    )
    const data = menus
      .filter((menu) =>
        selectedDownloadAttGroups.map((group) => group.name).includes(menu.name)
      )
      .map(({ name, children }) => ({
        name,
        children: (children ?? [])
          .map((childId: string) =>
            topicData.attributes.find((attr) => childId === attr.id)
          )
          .filter((attr): attr is Attribute => attr !== undefined),
      }))
    try {
      exportAttributeDetails({ data, filename: `${topicData.name}.xlsx` })
      toast({
        type: 'success',
        message: t('attributesSuccessfullyExported'),
      })
    } catch (error) {
      toast({
        type: 'error',
        message: t('exportAttributesFailed'),
      })
    } finally {
      handleDownloadDrawer()
    }
  }

  const height = '500px'

  const handleCheckboxChange = (
    attribute: string,
    value: boolean,
    optionId?: string
  ) => {
    setCheckedStates((prevCheckedStates) => ({
      ...prevCheckedStates,
      [attribute]: value,
    }))
    handleInputChange(attribute, value, optionId)
  }

  const handleOptionChange = (attribute: string, newOption: PickListOption) => {
    setSinglePickListOptions((prevOptionStates) => ({
      ...prevOptionStates,
      [attribute]: newOption,
    }))
  }

  const renderEditComponent = (data: AttributeValue, isList = false) => {
    switch (data.value_type) {
      case 'Boolean': {
        const booleanValue = Boolean(data.value)
        const isYesChecked =
          checkedStates[data.attribute] !== undefined
            ? checkedStates[data.attribute]
            : booleanValue
        const isNoChecked =
          checkedStates[data.attribute] !== undefined
            ? !checkedStates[data.attribute]
            : !booleanValue

        return (
          <div>
            <Checkbox
              label='Yes'
              type='radio'
              checked={isYesChecked}
              stateName='value'
              name='boolean'
              callout={() =>
                handleCheckboxChange(
                  data.attribute,
                  true,
                  isList ? data.id : undefined
                )
              }
            />
            <Checkbox
              label='No'
              type='radio'
              checked={isNoChecked}
              stateName='value'
              name='boolean'
              callout={() =>
                handleCheckboxChange(
                  data.attribute,
                  false,
                  isList ? data.id : undefined
                )
              }
            />
          </div>
        )
      }
      case 'Date':
        return (
          <DatepickerNew
            isSingle
            startDate={
              data.value != null ? moment(String(data.value)) : moment()
            }
            onDateChange={(startDate) => {
              handleInputChange(
                data.attribute,
                moment.utc(startDate?.format('YYYY-MM-DD')).toISOString(),
                isList ? data.id : undefined
              )
            }}
            showAllDates
            appendToBody
          />
        )
      case 'Text':
        return (
          <TextInput
            callout={(_, value) =>
              handleInputChange(
                data.attribute,
                String(value),
                isList ? data.id : undefined
              )
            }
            labelText=''
            stateName='value'
            type='text'
            value={String(data.value)}
          />
        )
      case 'Number':
        return (
          <TextInput
            callout={(_, value) =>
              handleInputChange(
                data.attribute,
                String(value),
                isList ? data.id : undefined
              )
            }
            labelText=''
            stateName='value'
            type='number'
            value={String(data.value)}
          />
        )
      case 'Pick List':
        if (Array.isArray(data?.value)) {
          const displayValue = data?.value
            ?.map((valId) => {
              if (typeof valId === 'string') {
                const optionExists =
                  data?.options?.find((option) => option.id === valId) || null
                if (optionExists !== null) {
                  return {
                    id: valId,
                    label: optionExists.label,
                  }
                }
              }
              return null
            })
            .filter((val): val is PickListOption => !!val)

          if (data?.maximum && data?.maximum > 1) {
            return (
              <MultiSelect
                selectPlaceholder={c('select')}
                options={data?.options?.map((option) => ({
                  label: option?.label,
                  id: option?.id,
                }))}
                labelKey='label'
                callout={(selectedList) => {
                  const values = selectedList.map((item) => item.id)
                  setMultiplePickListOptions((prevOptionStates) => ({
                    ...prevOptionStates,
                    [data?.attribute]: selectedList,
                  }))
                  handleInputChange(data?.attribute, values)
                }}
                searchBarProps={{
                  placeholder: c('search'),
                  value: '',
                  show: true,
                }}
                selectedOptions={
                  multiplePickListOptions[data?.attribute] ?? displayValue
                }
                hideSelectAll
              />
            )
          }

          const [selectedOption] = displayValue
          return (
            <NewSelect
              noBorder
              options={data?.options?.map((option) => ({
                label: option?.label,
                id: option?.id,
              }))}
              optionKeyName='label'
              labelKeyName='label'
              onChange={(option) => {
                handleOptionChange(data?.attribute, option)
                handleInputChange(data?.attribute, [option.id])
              }}
              selectedItem={
                singlePickListOptions[data?.attribute] ?? selectedOption
              }
            />
          )
        }
        break
      case 'List':
        return (
          <table id={data.id} key={data.id}>
            <tbody>
              {data?.options?.map((option) => {
                const optionValue =
                  Array.isArray(data?.value) &&
                  isObjectValueArray(data?.value) &&
                  data?.value.find((val) => val.id === option.id)
                return (
                  <tr key={option.id}>
                    <td>{`${option.label}:`}</td>
                    <td>
                      <div>
                        {renderEditComponent(
                          {
                            ...option,
                            value: optionValue ? optionValue.value : '',
                            attribute: data.attribute,
                            options: [],
                          },
                          true
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )
    }
  }

  const handleListValueType = (item: {
    options: RawOption[]
    value: ObjectValue[]
  }) => {
    return (
      <div>
        {item?.options?.map((option) => {
          const foundValue =
            Array.isArray(item.value) &&
            item.value.find((val) => val.id === option.id)?.value
          return (
            <div key={option.id}>
              {renderDisplayComponent({ ...option, value: foundValue }, true)}
            </div>
          )
        })}
      </div>
    )
  }

  const prepareValueForPickList = (item: {
    value: string[]
    options: RawOption[]
  }) => {
    if (Array.isArray(item.value)) {
      const result = item?.value?.map((valueId) => {
        return (
          item?.options?.find((option) => option?.id === valueId)?.label || ''
        )
      })
      return result.join(', ')
    }
    return ''
  }

  const renderDisplayComponent = (data: any, isList = false) => {
    const label = isList ? `${data.label}: ` : null
    switch (data.value_type) {
      case 'Boolean':
        return (
          <div>
            {label} {data.value ? 'Yes' : 'No'}
          </div>
        )
      case 'Date':
        return (
          <div>
            {label} {moment.utc(data.value).format('MM/DD/YYYY')}
          </div>
        )
      case 'Text':
      case 'Number':
        return (
          <div>
            {label} {data.value}
          </div>
        )
      case 'List':
        return handleListValueType(data)
      case 'Pick List':
        return <div>{prepareValueForPickList(data)}</div>
    }
  }

  const tableConfig = [
    {
      cell: {
        children: (data: any) => {
          if (isMobileView) {
            return (
              <Tooltip
                tooltipContent={data.attribute}
                useSideDrawerForMobile
                sideDrawerHeader={t('attribute')}
              >
                <span>{trimText(data.attribute, 30)}</span>
              </Tooltip>
            )
          }
          return data.attribute
        },
      },
      label: t('attribute'),
      mainColumn: true,
      name: 'attribute',
      tooltip: {
        content: 'tooltip',
      },
    },
    {
      cell: {
        children: (data: any) => {
          const isEditing = editingAttributes.includes(data.attribute)
          return isEditing ? (
            renderEditComponent(data)
          ) : data.value && data.value.length > 50 ? (
            <Tooltip
              tooltipContent={data.value}
              useSideDrawerForMobile
              sideDrawerHeader={data.attribute}
            >
              <span>{trimText(data.value, 50)}</span>
            </Tooltip>
          ) : (
            renderDisplayComponent(data)
          )
        },
      },
      label: t('value'),
      name: 'value',
      tooltip: {
        content: 'tooltip',
      },
    },
    ...(isMobileView
      ? []
      : [
          {
            cell: {
              children: (data: AttributeValue) => (
                <div className={styles.actionCell}>
                  <ButtonGroup
                    styleType={
                      editingAttributes.includes(data.attribute)
                        ? 'primary-blue'
                        : undefined
                    }
                    buttons={[
                      {
                        actions: [
                          {
                            text: c('delete'),
                            callout: () => null,
                            icon: 'trash',
                            confirmation: {
                              header: c('areYouSure'),
                              body: t('areYouSureYouWantToDeleteAttribute', {
                                attribute: data.attribute,
                              }),
                              type: 'red',
                              confirmButtonText: c('confirm'),
                              confirmCallout: () =>
                                confirmDeleteAttribute(data),
                            },
                          },
                        ],
                      },
                      {
                        children: editingAttributes.includes(data.attribute)
                          ? editingAttributes.length > 1
                            ? c('saveAll')
                            : c('save')
                          : c('edit'),
                        onClick: () => {
                          editingAttributes.includes(data.attribute)
                            ? editingAttributes.length > 1
                              ? handleSaveAllAttributes()
                              : handleSaveAttribute(data.attribute)
                            : handleEditAttribute(data.attribute)
                        },
                      },
                    ]}
                  />
                </div>
              ),
            },
            label: '',
            name: 'action',
            noSort: true,
            isButton: true,
          },
        ]),
  ]

  return (
    <div>
      <div
        className={
          isMobileView
            ? styles.mobileAttributesContainer
            : styles.attributesContainer
        }
      >
        {!isMobileView ? (
          <SelectDisplay
            active='name'
            hasBorder
            options={
              attributeGroupsData?.attribute_groups.map((group) => ({
                label: group.name,
                name: group.name,
              })) || []
            }
            callout={(option) => handleAttGroupClick(option.name)}
          />
        ) : (
          <NewSelect
            onChange={(value) => {
              if (value) {
                handleAttGroupClick(value.name)
              }
            }}
            options={
              attributeGroupsData?.attribute_groups.map((group) => ({
                id: group.name,
                name: group.name,
              })) || []
            }
            optionKeyName='name'
            labelKeyName='name'
            selectedItem={{
              id: selectedAttGroup,
              name: selectedAttGroup,
            }}
          />
        )}

        <div className={isMobileView ? '' : styles.TableContainer}>
          {!isMobileView && <div className='fw-bold'>{selectedAttGroup}</div>}
          <StandardTable
            customWidth='100%'
            customHeight={height}
            config={tableConfig}
            data={tableData}
            dataKey='attribute'
            getData={() => {
              console.log('getData')
            }}
            hasData={tableData.length > 0}
            noDataFields={{
              primaryText: t('noDataAvailable'),
              secondaryText: t('thereIsNoDataAvailableForThisCollectionFolder'),
            }}
            successStatus
            tableId='attributes_table'
            hasMore={false}
            loading={isLoading || isPending}
            sort={() => {
              console.log('sort functionality')
            }}
            sortBy={{
              prop: '',
              flip: false,
              lowerCaseParam: undefined,
            }}
          />
        </div>
      </div>
      <PageFooter
        rightSection={[
          {
            children: c('download'),
            onClick: handleDownloadDrawer,
            type: 'button',
            disabled: !topicData,
          },
          {
            children: t('addAttributes'),
            onClick: addAttributesDrawer,
            type: 'button',
            styleType: 'primary-blue',
          },
        ]}
      />
      <AddExistingAttributesDrawer
        isOpen={isOpen}
        onClose={addAttributesDrawer}
        onSave={handleSaveSelectedAttributes}
        excludeAttributes={excludedAttributes}
        selectedAttributes={selectedAttributes}
        setSelectedAttributes={setSelectedAttributes}
      />

      <DownloadAttributesDrawer
        isOpen={isDownloadOpen}
        onClose={handleDownloadDrawer}
        onDownload={handleDownload}
        attributeGroupsNew={attributeGroupsData?.attribute_groups || []}
        selectedDownloadAttGroups={selectedDownloadAttGroups}
        setSelectedDownloadAttGroups={setSelectedDownloadAttGroups}
      />
    </div>
  )
}
