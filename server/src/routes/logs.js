const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')

// 日志存储目录
const LOG_DIR = path.join(__dirname, '../../exports')
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

// 日志文件路径
const LOG_FILE = path.join(LOG_DIR, 'access_logs.csv')

// 确保日志文件存在并写入表头
const initializeLogFile = () => {
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, 'timestamp,userAgent,message,url\n', 'utf8')
  }
}

// 初始化日志文件
initializeLogFile()

// 处理日志上报的POST接口
router.post('/', express.json(), (req, res) => {
  try {
    const { userAgent, timestamp, message, url } = req.body
    if (!userAgent || !timestamp) {
      return res.status(400).json({ error: '缺少必要的日志字段' })
    }

    // 格式化CSV行，处理逗号和引号
    const formatCSVField = (field) => {
      if (typeof field !== 'string') field = String(field)
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`
      }
      return field
    }

    // 构建CSV行
    const csvLine = [
      formatCSVField(timestamp),
      formatCSVField(userAgent),
      formatCSVField(message || ''),
      formatCSVField(url || '')
    ].join(',') + '\n'

    // 追加到日志文件
    fs.appendFileSync(LOG_FILE, csvLine, 'utf8')

    // 记录到控制台
    console.log(`[Client Log] ${timestamp} - ${userAgent}: ${message || '访问了页面'}`)

    // 返回成功响应
    res.status(200).json({ status: 'success', message: '日志已记录' })
  } catch (error) {
    console.error('日志处理失败:', error)
    res.status(500).json({ error: '日志处理失败', message: error.message })
  }
})

// 获取日志的GET接口（用于调试）
router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return res.status(404).json({ error: '日志文件不存在' })
    }
    const logs = fs.readFileSync(LOG_FILE, 'utf8')
    res.set('Content-Type', 'text/csv')
    res.send(logs)
  } catch (error) {
    console.error('获取日志失败:', error)
    res.status(500).json({ error: '获取日志失败', message: error.message })
  }
})

module.exports = router
