const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')
const { sequelize, Inventory } = require('../db')

const csvFilePath = path.resolve(__dirname, '../../data/inventory.csv')

const migrate = async () => {
  try {
    await sequelize.sync()
    console.log('Database synchronized.')

    if (!fs.existsSync(csvFilePath)) {
      console.log('Inventory CSV file not found, skipping migration.')
      return
    }

    const csvFile = fs.readFileSync(csvFilePath, 'utf8')
    const parsed = Papa.parse(csvFile, { header: true, skipEmptyLines: true })
    
    const inventoryData = parsed.data.map(item => ({
      name: item.name,
      quantity: parseInt(item.quantity) || 0,
      lowStockThreshold: parseInt(item.lowStockThreshold) || 10
    })).filter(item => item.name)

    if (inventoryData.length > 0) {
      await Inventory.bulkCreate(inventoryData, { ignoreDuplicates: true })
      console.log(`Successfully migrated ${inventoryData.length} inventory items.`)
    }

  } catch (error) {
    console.error('Inventory migration failed:', error)
  } finally {
    await sequelize.close()
  }
}

migrate() 