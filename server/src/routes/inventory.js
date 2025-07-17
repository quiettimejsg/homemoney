const express = require('express')
const router = express.Router()
const inventoryController = require('../controllers/inventory')

// 获取所有库存项
router.get('/', inventoryController.getInventory)

// 添加库存项
router.post('/', inventoryController.addInventoryItem)

// 更新库存项
router.put('/:id', inventoryController.updateInventoryItem)

// 删除库存项
router.delete('/:id', inventoryController.deleteInventoryItem)

module.exports = router
