const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')
const { sequelize, Expense } = require('../db')

const csvFilePath = path.resolve(__dirname, '../../exports/expenses_initial.csv')

const migrate = async () => {
  try {
    // 1. 同步数据库，确保表已创建
    await sequelize.sync({ alter: true })
    console.log('Database synchronized.')

    // 2. 读取并解析 CSV 文件
    if (!fs.existsSync(csvFilePath)) {
      console.error('CSV file not found:', csvFilePath)
      return
    }
    const csvFile = fs.readFileSync(csvFilePath, 'utf8')
    const parsed = Papa.parse(csvFile, { header: true, skipEmptyLines: true })

    if (parsed.errors.length) {
      console.error('CSV parsing errors:', parsed.errors)
    }

    const expensesData = parsed.data
      .map(item => ({
        type: item.type,
        remark: item.remark,
        amount: parseFloat(item.amount),
        time: new Date(item.time)
      }))
      .filter(item => item.type && item.amount && !isNaN(item.amount) && item.time && !isNaN(item.time.getTime()))

    if (expensesData.length === 0) {
      console.log('No valid data to migrate.')
      return
    }
    
    // 3. 将数据插入数据库
    await Expense.bulkCreate(expensesData)
    console.log(`Successfully migrated ${expensesData.length} records from CSV to SQLite.`)

  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await sequelize.close()
    console.log('Database connection closed.')
  }
}

migrate()
