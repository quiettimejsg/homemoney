const express = require('express')
const router = express.Router()

// 默认的屏蔽列表
const defaultBlocklist = [
  'example.com',
  'malicious-site.com',
  'spam-domain.net'
]

/**
 * 获取屏蔽列表API
 * 用于GenAIWebpageEligibilityService.js前端服务
 */
router.get('/', (req, res) => {
  try {
    // 添加CORS头，确保跨域请求可以正常工作
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

    // 返回默认屏蔽列表
    res.json(defaultBlocklist)
  } catch (error) {
    console.error('获取屏蔽列表失败:', error)
    res.status(500).json({ error: '获取屏蔽列表失败', message: error.message })
  }
})

module.exports = router
