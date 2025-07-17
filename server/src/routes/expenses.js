const express = require('express')
const router = express.Router()
const { getExpensesCsv, getExpenses, processBatchExpenses } = require('../controllers/expenses')

// 批量添加消费记录接口
router.post('/batch', async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: '请求体必须是数组格式' })
    }
    const result = await processBatchExpenses(req.body)
    res.status(201).json({ message: `成功添加${result.successCount}条记录`, failed: result.failedCount })
  } catch (error) {
    console.error('批量添加记录失败:', error)
    res.status(500).json({ error: '批量添加失败', message: error.message })
  }
})

// CSV原始数据导出接口
router.get('/csv/raw', async (req, res) => {
  try {
    const csvData = await getExpensesCsv()
    res.set('Content-Type', 'text/csv')
    res.send(csvData)
  } catch (error) {
    console.error('CSV导出失败:', error)
    res.status(500).json({ error: 'CSV导出失败', message: error.message })
  }
})

// 消费数据获取接口
router.get('/', async (req, res) => {
  try {
    const expenses = await getExpenses()

    // 添加CORS头，确保跨域请求可以正常工作
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

    // 确保返回的是数组格式
    if (!Array.isArray(expenses)) {
      console.warn('警告: expenses不是数组格式，进行转换')
      res.json(Array.isArray(expenses.data) ? expenses.data : [])
    } else {
      res.json(expenses)
    }
  } catch (error) {
    console.error('获取消费数据失败:', error)
    res.status(500).json({ error: '获取消费数据失败', message: error.message })
  }
})

// 添加消费记录接口
router.post('/', async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: '请求体为空' })
    const { addExpense } = require('../controllers/expenses')
    await addExpense(req, res)
    res.status(201).json({ message: '记录添加成功' })
  } catch (error) {
    console.error('添加消费记录失败:', error)
    res.status(500).json({ error: '添加记录失败', message: error.message })
  }
})

module.exports = router
