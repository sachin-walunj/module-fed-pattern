import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import moment from 'moment'

import { Attribute } from '@amplifi-workspace/store'

const formatDate = (
  date: moment.MomentInput,
  format = 'MM/DD/YYYY'
): string => {
  const dateValue = date ? moment(date).format(format) : ''
  return dateValue
}

// Formats the display value of an attribute based on its type
const formatAttributeDisplay = (item: Attribute): string => {
  const { value, value_type, options } = item
  let displayValue = ''
  if (!value_type || value === undefined || value === null) {
    return displayValue
  }
  if (['List', 'Pick List'].includes(value_type) && !Array.isArray(value)) {
    return displayValue
  }
  switch (value_type) {
    case 'Boolean':
      displayValue = value ? 'Yes' : 'No'
      break
    case 'Date':
      displayValue = formatDate(value)
      break
    case 'Text':
    case 'Number':
      displayValue = value
      break
    case 'Pick List':
      displayValue = value
        .map((id) => {
          const option = options.find((option) => option.id === id)
          return option ? option.label : null
        })
        .filter(Boolean)
        .join('; ')
      break
    case 'List':
      displayValue = value
        .map((el) => {
          const option = options.find((option) => option.id === el.id)
          return option
            ? `${option.label}: ${formatAttributeDisplay({
                ...el,
                options,
                group_id: item.group_id,
                language_code: item.language_code,
                region_ids: item.region_ids,
                roles: item.roles,
              })}`
            : null
        })
        .filter(Boolean)
        .join(', ')
      break
  }
  return displayValue || ''
}

// Function to export attribute details to an Excel file
export const exportAttributeDetails = (payload: {
  data: { name: string; children: Attribute[] }[]
  filename: string
}) => {
  const workbook = new ExcelJS.Workbook()
  const { data, filename } = payload
  data.forEach((group) => {
    const worksheet = workbook.addWorksheet(group.name)
    const rowValues: string[] = []
    worksheet.columns = group.children.map((child) => {
      rowValues.push(formatAttributeDisplay(child))
      return {
        header: child.label,
        key: child.id,
        width: 50,
      }
    })
    worksheet.addRow(rowValues)
    worksheet.state = 'visible'
  })

  workbook.xlsx.writeBuffer().then((buffer: BlobPart) => {
    // The saveAs function can be used to save files in various formats such as .xlsx, .txt, .csv, .pdf, .png, .jpg, etc.
    saveAs(new Blob([buffer]), filename)
  })
}
