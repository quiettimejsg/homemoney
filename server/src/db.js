const Sequelize = require('sequelize')
const path = require('path')
const sequelize = new Sequelize({ dialect: 'sqlite', storage: path.join(__dirname, '../database.sqlite') })

module.exports = { sequelize }

const Papa = require('papaparse')
const fs = require('fs/promises')
const csvPath = path.join(__dirname, '../exports/expenses_initial.csv');

// 确保CSV文件存在并包含表头
(async () => {
  try {
    await fs.access(csvPath)
  } catch {
    // 文件不存在，创建文件并写入表头
    await fs.writeFile(csvPath, 'type,amount,time,remark,id\n')
  }
})();

// 确保exports目录存在
(async () => {
  const exportsDir = path.dirname(csvPath)
  try {
    await fs.access(exportsDir)
  } catch {
    await fs.mkdir(exportsDir, { recursive: true })
  }
})()
const feedbackPath = path.join(__dirname, '../exports/feedback.csv')

class ExpenseBuilder {
  constructor () {
    this.expense = {}
  }

  setType (type) {
    if (!type) throw new Error('消费类型不能为空')
    this.expense.type = type
    return this
  }

  setRemark (remark) {
    this.expense.remark = remark || ''
    return this
  }

  setAmount (amount) {
    if (typeof amount !== 'number' || amount <= 0) throw new Error('消费金额必须为正数')
    this.expense.amount = amount
    return this
  }

  setTime (time) {
    if (!time || isNaN(Date.parse(time))) throw new Error('时间格式无效')
    this.expense.time = time
    return this
  }

  build () {
    if (!this.expense.type) throw new Error('消费类型不能为空')
    if (typeof this.expense.amount !== 'number' || this.expense.amount <= 0) throw new Error('消费金额必须为正数')
    if (!this.expense.time || isNaN(Date.parse(this.expense.time))) throw new Error('时间格式无效')
    return this.expense
  }
}

async function addExpense (expense) {
  // 构造CSV行（列顺序与现有CSV文件一致）

  const csvLine = Papa.unparse([expense], { header: false }) + '\n' // 使用PapaParse处理特殊字符
  try {
    await fs.appendFile(csvPath, csvLine)
    return { success: true, message: '数据已成功追加到CSV文件' }
  } catch (err) {
    throw new Error(`写入CSV文件失败: ${err.message}`)
  }
}

// 批量添加消费记录
async function addExpensesBatch (records) {
  let successCount = 0
  let failedCount = 0
  const builder = new ExpenseBuilder()
  const csvLines = []
  const Papa = require('papaparse')

  for (const record of records) {
    try {
      const validated = builder
        .setType(record.type)
        .setRemark(record.remark)
        .setAmount(record.amount)
        .setTime(record.time)
        .build()

      csvLines.push(Papa.unparse([validated], { header: false }))
      successCount++
    } catch (error) {
      failedCount++
      console.error('记录验证失败:', error.message)
    }
  }

  if (csvLines.length > 0) {
    const csvData = csvLines.join('\n') + '\n'
    await fs.appendFile(csvPath, csvData)
  }

  return { successCount, failedCount }
}

// CSV数据库连接状态检查（检查文件是否可访问）
async function getConnectionStatus () {
  try {
    const stats = await fs.stat(csvPath)
    return {
      state: 'connected',
      timestamp: new Date().toISOString(),
      message: 'CSV文件可正常访问',
      fileSize: `${(stats.size / 1024).toFixed(2)} KB`,
      lastModified: stats.mtime
    }
  } catch (err) {
    console.error('CSV文件访问错误:', err)
    return {
      state: 'disconnected',
      timestamp: new Date().toISOString(),
      message: `CSV文件访问失败: ${err.code === 'ENOENT' ? '文件不存在' : '权限不足'}`
    }
  }
}

// 新增数据库健康检查方法
const checkDatabaseHealth = async () => {
  try {
    // 检查CSV文件是否可访问
    await fs.access(csvPath)
    return true
  } catch (error) {
    console.error('CSV文件访问失败:', error)
    return false
  }
}

// 删除消费记录（根据ID）
async function deleteExpense (targetId) {
  try {
    const csvData = await fs.readFile(csvPath, 'utf8')
    const parsed = Papa.parse(csvData, { header: false, skipEmptyLines: true }) // 跳过空行避免解析错误
    const filtered = parsed.data.filter(row => row[row.length - 1].toString() !== targetId.toString()) // 统一转为字符串比较
    const header = ['type', 'remark', 'amount', 'time'] // 移除ID字段
    const newCsv = Papa.unparse([header, ...filtered], { header: false }) // 手动写入正确表头
    await fs.writeFile(csvPath, newCsv)
  } catch (err) {
    throw new Error(`删除记录失败: ${err.message}`)
  }
}

// 新增反馈存储方法
async function addFeedback (feedback) {
  const Papa = require('papaparse')
  const csvLine = Papa.unparse([feedback], { header: false }) + '\n'

  try {
    // 如果文件不存在则创建并写入表头
    if (!await fileExists(feedbackPath)) {
      await fs.writeFile(feedbackPath, 'timestamp,deviceInfo,type,content,logs\n')
    }

    await fs.appendFile(feedbackPath, csvLine)
    return { success: true }
  } catch (err) {
    throw new Error(`写入反馈失败: ${err.message}`)
  }
}

// 辅助方法检查文件存在性
async function fileExists (path) {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

module.exports = {
  sequelize,
  addExpensesBatch,
  deleteExpense,
  addExpense,
  ExpenseBuilder,
  connectionStatus: getConnectionStatus,
  checkDatabaseHealth,
  addFeedback
}
