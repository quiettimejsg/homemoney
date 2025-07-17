const XLSX = require('xlsx')
const { addExpensesBatch } = require('../db')

class ImportService {
  async importFromExcel (filePath) {
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    // 数据验证和转换
    const records = data.map(item => ({
      type: item['支類'] || item.Category,
      remark: item['事由'] || item.Description || '',
      amount: parseFloat((item['錢數（文）'] || item['Amount ($)'] || '').toString().replace(/[^0-9.]/g, '')) || 0,
      time: item['用日'] || item.Date
    }))

    return await addExpensesBatch(records)
  }
}

module.exports = ImportService
