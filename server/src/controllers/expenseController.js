const { Expense } = require('../db')
const dayjs = require('dayjs')

const getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page, 10)
    const pageSize = parseInt(limit, 10)

    const offset = (pageNum - 1) * pageSize

    const { count, rows } = await Expense.findAndCountAll({
      limit: pageSize,
      offset: offset,
      order: [['time', 'DESC']]
    })

    res.json({
      data: rows,
      total: count,
      page: pageNum,
      limit: pageSize
    })
  } catch (err) {
    console.error('获取消费记录失败:', err)
    res.status(500).json({ error: '读取数据失败' })
  }
}

const addExpense = async (req, res) => {
  try {
    const { type, remark, amount, time } = req.body

    // 后端数据验证
    if (!type || !amount) {
      return res.status(400).json({ error: '消费类型和金额是必填项' })
    }

    const newExpense = await Expense.create({
      type,
      remark,
      amount: parseFloat(amount),
      time: time ? dayjs(time).toDate() : dayjs().toDate()
    })

    res.status(201).json(newExpense)
  } catch (error) {
    console.error('添加消费记录失败:', error)
    res.status(500).json({ error: '无法添加记录' })
  }
}

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Expense.destroy({
      where: { id: id }
    })

    if (deleted) {
      res.status(204).send()
    } else {
      res.status(404).json({ error: '未找到要删除的记录' })
    }
  } catch (error) {
    console.error('删除消费记录失败:', error)
    res.status(500).json({ error: '无法删除记录' })
  }
}

module.exports = {
  getExpenses,
  addExpense,
  deleteExpense
}
