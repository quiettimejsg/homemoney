const express = require('express')
const path = require('path')
const fs = require('fs').promises // 用于异步文件操作
const { getConnectionStatus } = require('../db')
const router = express.Router()

// 增强健康检查端点
router.get('/healthcheck', async (req, res) => {
  try {
    const dbStatus = await getConnectionStatus()
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Household Finance Manager',
      version: process.env.npm_package_version,
      database: dbStatus,
      memoryUsage: process.memoryUsage()
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '服务状态异常',
      error: error.message
    })
  }
})

// 维护状态查询接口
router.get('/maintenance', async (req, res) => {
  try {
    // 读取服务器配置文件
    const configPath = path.join(__dirname, '../../config.json')
    const configContent = await fs.readFile(configPath, 'utf8')
    const { maintenance } = JSON.parse(configContent)
    res.status(200).json({ maintenance })
  } catch (error) {
    console.error('维护状态查询失败:', error)
    res.status(500).json({ error: '服务器维护状态查询失败' })
  }
})

// 获取完整配置接口（包含maintenance和premaintenance）
router.get('/config', async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../config.json')
    const configContent = await fs.readFile(configPath, 'utf8')
    const { maintenance, premaintenance } = JSON.parse(configContent)
    res.status(200).json({ maintenance, premaintenance })
  } catch (error) {
    console.error('获取配置失败:', error)
    res.status(500).json({ error: '获取配置失败' })
  }
})

module.exports = router
