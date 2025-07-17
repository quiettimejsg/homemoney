const express = require('express')
const config = require('../../config.json')
const router = express.Router()

// 维护状态接口
router.get('/', (req, res) => {
  res.json({
    maintenance: !!config.maintenance, // 显式转换为布尔值
    status: config.maintenance ? 'maintenance' : 'normal',
    message: config.maintenance ? config.message : '系统正常运行',
    timestamp: new Date().toISOString()
  })
})

module.exports = router
