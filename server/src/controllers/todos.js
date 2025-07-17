const fs = require('fs').promises
const path = require('path')
const Papa = require('papaparse')

// 定义CSV文件路径
const TODO_FILE_PATH = path.join(__dirname, '../../data/todos.csv')

// 确保数据目录存在
const ensureDataDir = async () => {
  const dataDir = path.dirname(TODO_FILE_PATH)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// 初始化CSV文件（如果不存在）
const initializeTodoFile = async () => {
  await ensureDataDir()
  try {
    await fs.access(TODO_FILE_PATH)
  } catch {
    // 如果文件不存在，创建并写入表头
    await fs.writeFile(TODO_FILE_PATH, 'id,text,completed,createdAt\n')
  }
}

// 获取待办事项
const getTodos = async (req, res) => {
  try {
    await initializeTodoFile()
    const csvData = await fs.readFile(TODO_FILE_PATH, 'utf8')
    const { data } = Papa.parse(csvData, { header: true })
    res.status(200).json(data)
  } catch (error) {
    console.error('Error reading todos:', error)
    res.status(500).json({ error: 'Failed to read todos' })
  }
}

// 保存待办事项到CSV文件
const saveTodos = async (req, res) => {
  try {
    const todos = req.body
    if (!Array.isArray(todos)) {
      return res.status(400).json({ error: 'Todos must be an array' })
    }

    await initializeTodoFile()

    // 将待办事项转换为CSV格式
    const csv = Papa.unparse(todos, { header: true })
    await fs.writeFile(TODO_FILE_PATH, csv)

    res.status(200).json({ message: 'Todos saved successfully' })
  } catch (error) {
    console.error('Error saving todos:', error)
    res.status(500).json({ error: 'Failed to save todos' })
  }
}

module.exports = {
  saveTodos,
  getTodos
}
