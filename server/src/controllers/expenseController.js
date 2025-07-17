const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')

const getExpenses = async (req, res) => {
  const results = []
  const csvPath = path.join(__dirname, '../../exports/expenses_initial.csv')
  const { page = 1, limit = 20 } = req.query
  const pageNum = parseInt(page, 10)
  const pageSize = parseInt(limit, 10)

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => results.push({
          ...data,
          金额: parseFloat(data.金额),
          日期: new Date(data.日期)
        }))
        .on('end', resolve)
        .on('error', reject)
    })

    // 实现分页逻辑
    const startIndex = (pageNum - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedResults = results.slice(startIndex, endIndex)

    res.json({
      data: paginatedResults,
      total: results.length,
      page: pageNum,
      limit: pageSize
    })
  } catch (err) {
    console.error('读取CSV文件失败:', err)
    res.status(500).json({ error: '读取数据失败' })
  }
}

module.exports = { getExpenses }
