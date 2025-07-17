const fs = require('fs').promises
const path = require('path')
const Papa = require('papaparse')

// 定义CSV文件路径
const INVENTORY_FILE_PATH = path.join(__dirname, '../../data/inventory.csv')

// 确保数据目录存在
const ensureDataDir = async () => {
  const dataDir = path.dirname(INVENTORY_FILE_PATH)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// 初始化CSV文件（如果不存在）
const initializeInventoryFile = async () => {
  await ensureDataDir()
  try {
    await fs.access(INVENTORY_FILE_PATH)
  } catch {
    // 如果文件不存在，创建并写入表头
    const headers = ['id,name,category,quantity,unit,lowStockThreshold,expiryDate,createdAt\n']
    await fs.writeFile(INVENTORY_FILE_PATH, headers)
  }
}

// 获取所有库存项
const getInventory = async (req, res) => {
  try {
    await initializeInventoryFile()
    const csvData = await fs.readFile(INVENTORY_FILE_PATH, 'utf8')
    const { data } = Papa.parse(csvData, { header: true })
    // 转换数值类型字段
    const inventory = data.map(item => ({
      ...item,
      quantity: parseInt(item.quantity) || 0,
      lowStockThreshold: parseInt(item.lowStockThreshold) || 0
    }))
    res.status(200).json(inventory)
  } catch (error) {
    console.error('Error reading inventory:', error)
    res.status(500).json({ error: 'Failed to read inventory' })
  }
}

// 添加库存项
const addInventoryItem = async (req, res) => {
  try {
    const newItem = req.body
    // 验证必填字段
    if (!newItem.name || !newItem.quantity || !newItem.unit) {
      return res.status(400).json({ error: 'Name, quantity and unit are required' })
    }

    await initializeInventoryFile()
    const csvData = await fs.readFile(INVENTORY_FILE_PATH, 'utf8')
    const { data } = Papa.parse(csvData, { header: true })

    // 确保ID唯一
    const itemWithId = {
      ...newItem,
      id: newItem.id || Date.now().toString()
    }

    data.push(itemWithId)
    const updatedCsv = Papa.unparse(data, { header: true })
    await fs.writeFile(INVENTORY_FILE_PATH, updatedCsv)

    res.status(201).json(itemWithId)
  } catch (error) {
    console.error('Error adding inventory item:', error)
    res.status(500).json({ error: 'Failed to add inventory item' })
  }
}

// 更新库存项
const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params
    const updatedItem = req.body

    await initializeInventoryFile()
    const csvData = await fs.readFile(INVENTORY_FILE_PATH, 'utf8')
    const { data } = Papa.parse(csvData, { header: true })

    const index = data.findIndex(item => item.id === id)
    if (index === -1) {
      return res.status(404).json({ error: 'Inventory item not found' })
    }

    data[index] = { ...data[index], ...updatedItem }
    const updatedCsv = Papa.unparse(data, { header: true })
    await fs.writeFile(INVENTORY_FILE_PATH, updatedCsv)

    res.status(200).json(data[index])
  } catch (error) {
    console.error('Error updating inventory item:', error)
    res.status(500).json({ error: 'Failed to update inventory item' })
  }
}

// 删除库存项
const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params

    await initializeInventoryFile()
    const csvData = await fs.readFile(INVENTORY_FILE_PATH, 'utf8')
    const { data } = Papa.parse(csvData, { header: true })

    const filteredData = data.filter(item => item.id !== id)
    if (filteredData.length === data.length) {
      return res.status(404).json({ error: 'Inventory item not found' })
    }

    const updatedCsv = Papa.unparse(filteredData, { header: true })
    await fs.writeFile(INVENTORY_FILE_PATH, updatedCsv)

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    res.status(500).json({ error: 'Failed to delete inventory item' })
  }
}

module.exports = {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
}
