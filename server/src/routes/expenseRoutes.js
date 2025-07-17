const dayjs = require('dayjs')
const express = require('express')
const router = express.Router()
const { getExpenses, addExpense, addExpensesBatch, deleteExpense, getCsvPath } = require('../controllers/expenses')

const fs = require('fs')
const path = require('path')
const csvFilePath = path.join(__dirname, '../../exports/expenses_initial.csv')

/**
 * @api {get} /api/expenses 获取所有消费记录
 * @apiName GetExpenses
 * @apiGroup Expenses
 * @apiSuccess {Object[]} expenses 消费记录数组
 */
// 消费数据获取接口
router.get('/api/expenses', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  getExpenses(req, res)
})

/**
 * @api {post} /api/expenses 添加新消费记录
 * @apiName AddExpense
 * @apiGroup Expenses
 * @apiParam {string} type 消费类型
 * @apiParam {string} remark 消费项目名称
 * @apiParam {number} amount 消费金额
 * @apiParam {string} time 消费时间（ISO格式）
 * @apiSuccess {string} message 操作成功提示
 */
// 单条添加消费记录接口
router.post('/api/expenses', (req, res, next) => {
  try {
    req.body.amount = parseFloat(req.body.amount)
    req.body.time = dayjs(req.body.time).format('YYYY-MM-DD')
    next()
  } catch (e) {
    res.status(400).json({ error: '数据格式错误: ' + e.message })
  }
}, addExpense)

// 批量添加消费记录接口
router.post('/api/expenses/batch', async (req, res) => {
  try {
    const records = req.body
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: '请提供有效的记录数组' })
    }
    const result = await addExpensesBatch(records)
    res.status(201).json({ message: `成功添加 ${result.successCount} 条记录，${result.failedCount} 条失败` })
  } catch (error) {
    console.error('批量添加失败:', error)
    res.status(500).json({ error: '批量添加失败', message: error.message })
  }
})

/**
 * @api {get} /api/expenses/csv 获取最新CSV文件路径
 * @apiName GetCsv
 * @apiGroup Expenses
 * @apiSuccess {string} path CSV文件路径
 */
router.get('/api/expenses/csv', getCsvPath)

router.get('/api/expenses/csv/raw', async (req, res) => {
  if (!fs.existsSync(csvFilePath)) {
    return res.status(404).json({ error: 'CSV文件尚未生成' })
  }
  try {
    const data = await fs.promises.readFile(csvFilePath, 'utf8')
    res.type('text/csv').send(data)
  } catch (err) {
    console.error('读取CSV文件失败:', err)
    return res.status(500).json({ error: '无法读取CSV文件' })
  }
})

// 删除消费记录接口
router.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params
    await deleteExpense(id)
    res.json({ message: '记录删除成功' })
  } catch (error) {
    console.error('删除失败:', error)
    res.status(500).json({ error: '删除失败', message: error.message })
  }
})

module.exports = router
