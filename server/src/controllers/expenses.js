/**
 * 消费记录控制器
 * @module controllers/expenseController
 * @desc 处理消费记录的业务逻辑（如数据验证、统计计算）
 */
const { ExpenseBuilder, addExpensesBatch, deleteExpense } = require('../db')
const ExportService = require('../utils/export')
const fs = require('fs') // 引入完整fs模块以使用existsSync方法
const path = require('path')
const dayjs = require('dayjs') // 导入dayjs库

/**
 * 获取所有消费记录
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const Papa = require('papaparse')
const csvFilePath = path.join(__dirname, '../../exports/expenses_initial.csv')

module.exports.getExpenses = async () => {
  if (!fs.existsSync(csvFilePath)) {
    console.error('[Expense Error] CSV文件不存在:', csvFilePath)
    throw new Error('CSV文件尚未生成')
  }
  const csvData = await fs.promises.readFile(csvFilePath, 'utf8') // 使用promises版本的readFile
  const parsed = Papa.parse(csvData, { header: true })
  if (parsed.errors.length > 0) {
    console.error('[Expense Error] CSV解析错误:', parsed.errors)
  }
  // 过滤掉字段不完整的记录并记录错误
  const validData = parsed.data.filter((item, index) => {
    const hasRequiredFields = item.type && item.remark && item.amount !== undefined && item.time
    if (!hasRequiredFields) {
      console.error(`[Expense Error] 无效记录 (行${index + 2}): 缺少必要字段`, item)
    }
    return hasRequiredFields
  })
  return validData.map(item => ({
    // 移除未使用的变量赋值
    type: item.type,
    remark: item.remark,
    amount: Number(item.amount),
    time: item.time
  }))
}

/**
 * 添加新消费记录
 * @param {Object} req - Express请求对象（包含newExpense字段）
 * @param {Object} res - Express响应对象
 */
// 修正：使用正确的Promise读取方式
module.exports.getExpensesCsv = async () => {
  const csvPath = path.join(__dirname, '../../exports/expenses_initial.csv')
  // 确保使用promises版本并正确传递参数
  return await fs.promises.readFile(csvPath, { encoding: 'utf-8' })
}

// 原getCsvPath调整为
module.exports.processBatchExpenses = async (records) => {
  return await addExpensesBatch(records)
}

module.exports.getCsvPath = async (req, res) => {
  try {
    const exportService = new ExportService(req.app.locals.db)
    const csvPath = exportService.generateCSV()
    res.json({ path: csvPath })
  } catch (error) {
    res.status(500).json({ error: '生成CSV文件失败' })
  }
}

module.exports.deleteExpense = deleteExpense

module.exports.addExpense = async (req, res) => {
  try {
    // 新增数据预处理
    const processedData = {
      type: String(req.body.type || '').trim(),
      remark: String(req.body.remark || '').trim(), // 使用remark替代itemName
      amount: parseFloat(req.body.amount) || 0,
      time: dayjs(req.body.time).isValid()
        ? dayjs(req.body.time).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD')
    }

    // 新增必填字段验证
    if (!processedData.type) {
      throw new Error('消费类型不能为空')
    }

    const expense = new ExpenseBuilder()
      .setType(processedData.type)
      .setRemark(processedData.remark)
      .setAmount(processedData.amount)
      .setTime(processedData.time)
      .build()
    await req.app.locals.db.addExpense(expense)

    // 新增：同步写入CSV并打印日志
    const exportService = new ExportService(req.app.locals.db)
    const data = await exportService.getFullData()
    data.push(expense) // 添加新记录到数据数组
    const csvContent = Papa.unparse(data.map(item => ({
      type: item.type || '其他',
      remark: (item.remark || '').replace(/[\n\r]/g, ' ').replace(/"/g, '\\"'),
      amount: Number(item.amount || 0).toFixed(2),
      time: item.time ? dayjs(item.time).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
    })), {
      quoted: true,
      header: true,
      skipEmptyLines: true,
      newline: '\r\n'
    })
    const csvFilePath = path.join(__dirname, '../../exports/expenses_initial.csv')
    // 写入CSV文件并添加错误处理
    await fs.promises.writeFile(csvFilePath, csvContent, 'utf8')
    console.log('CSV文件写入成功:', csvFilePath)
    console.log('写入CSV路径:', csvFilePath)
    console.log('写入CSV内容:', csvContent)
    console.log('CSV写入完成')

    res.status(201).json({ message: '记录添加成功' })
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message })
  }
}
