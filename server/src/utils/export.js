const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')
const { Expense } = require('../db')

class ExportService {
  constructor () {}

  // 获取完整消费数据（异步方法）
  async getFullData () {
    return await Expense.findAll({ raw: true }) // 使用 Expense 模型获取数据
  }

  // 生成CSV文件（异步方法）
  async generateCSV () {
    const data = await this.getFullData() // 等待数据获取完成
    const csvContent = [
      '消费类型,备注,金额,时间',
      ...data.map(item => `${item.type},${item.remark || item.remark || ''},${item.amount},${item.time}`)
    ].join('\n')

    const exportDir = path.join(__dirname, '../../exports/')
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true }) // 确保导出目录存在
    }
    const filePath = path.join(exportDir, `expenses_${Date.now()}.csv`)
    fs.writeFileSync(filePath, csvContent)
    return filePath
  }

  // 生成Excel文件
  async generateExcel () {
    const data = await this.getFullData()
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '消费记录')

    const filePath = path.join(__dirname, '../../exports/', `expenses_${Date.now()}.xlsx`)
    XLSX.writeFile(workbook, filePath)
    return filePath
  }
}

module.exports = ExportService
