const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')
const { sequelize, Todo } = require('../db')

const csvFilePath = path.resolve(__dirname, '../../data/todos.csv')

const migrate = async () => {
  try {
    await sequelize.sync()
    console.log('Database synchronized for Todos.')

    if (!fs.existsSync(csvFilePath)) {
      console.log('Todos CSV file not found, skipping migration.')
      return
    }

    const csvFile = fs.readFileSync(csvFilePath, 'utf8')
    const parsed = Papa.parse(csvFile, { header: true, skipEmptyLines: true })
    
    const todosData = parsed.data.map(item => ({
      text: item.text,
      completed: item.completed === 'true' || item.completed === true
    })).filter(item => item.text)

    if (todosData.length > 0) {
      await Todo.bulkCreate(todosData, { ignoreDuplicates: true })
      console.log(`Successfully migrated ${todosData.length} todos.`)
    } else {
        console.log('No valid todo data to migrate.')
    }

  } catch (error) {
    console.error('Todo migration failed:', error)
  } finally {
    await sequelize.close()
    console.log('Database connection for Todos closed.')
  }
}

migrate() 