/**
 * 基础路由配置
 * @module routes/baseRoutes
 * @desc 定义基础健康检查等通用API端点
 */
const express = require('express')
const router = express.Router()
const { connectionStatus } = require('../db')
const fs = require('fs')
const path = require('path')

/**
 * @api {get} /api 基础健康检查
 * @apiName HealthCheck
 * @apiGroup Base
 * @apiSuccess {object} status 服务状态信息
 */
router.get('/api/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
    .status(200)
    .json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime().toFixed(2) + 's',
      database: connectionStatus(),
      initialData: fs.existsSync('../exports/expenses_initial.csv'),
      nodeEnv: process.env.NODE_ENV,
      distPath: path.join(__dirname, '../../../client/dist'),
      distExists: fs.existsSync(path.join(__dirname, '../../../client/dist'))
    })
})

// 保持旧端点兼容性
router.get('/api', (req, res) => {
  res.redirect('/api/health')
})

module.exports = router
