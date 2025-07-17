const path = require('path')
const os = require('os')
const http = require('http')
const fs = require('fs')
const express = require('express')
const { sequelize } = require('./db')
const cors = require('cors') // 新增CORS模块

const app = express()

// 存储请求日志
const requestLogs = []

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now()
  const originalSend = res.send
  res.send = function (body) {
    const duration = Date.now() - start
    requestLogs.push({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration
    })
    // 只保留最近50条日志
    if (requestLogs.length > 50) requestLogs.shift()
    originalSend.call(this, body)
  }
  next()
})

const dotenv = require('dotenv')
dotenv.config()

// 定义后端端口为动态3010
const PORT = process.env.PORT || 3010
const schedule = require('node-schedule')
const db = require('./db')
const ExportService = require('./utils/export')
const exportService = new ExportService(db)

// 设置每日凌晨自动备份
const backupRule = new schedule.RecurrenceRule()
backupRule.hour = 0
backupRule.minute = 0
backupRule.second = 0

schedule.scheduleJob(backupRule, async () => {
  try {
    console.log('Starting daily backup...')
    const backupPath = await exportService.generateExcel()
    console.log(`Daily backup completed successfully: ${backupPath}`)
  } catch (error) {
    console.error('Daily backup failed:', error.message)
  }
})

// 同步数据库模型
sequelize.sync({ alter: true }).then(() => {
  console.log('Database models synchronized')
}).catch(err => {
  console.error('Database synchronization error:', err)
})

// 配置CORS策略（开发环境）
app.use(cors({
  origin: function (origin, callback) { const allowedOrigins = ['http://localhost:5173', 'http://192.168.0.197:5173', 'http://127.0.0.1:5173', 'http://192.168.0.197:3010', 'http://localhost:3010']; if (allowedOrigins.includes(origin) || !origin) { callback(null, origin) } else { callback(new Error('Not allowed by CORS')) } }, // 动态验证允许的源并返回具体origin

  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'User-Agent'],
  credentials: true
}))

// 请求体解析中间件 - 移到路由之前
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 生产环境配置建议（部署时启用）
// app.use(cors({
//   origin: 'https://your-production-domain.com',
//   optionsSuccessStatus: 200
// }));

// 请求体解析中间件
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// 全局请求日志中间件
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] || 'unknown'
  if (userAgent === 'unknown') {
    console.warn(`[Missing User-Agent] ${req.method} ${req.url} - Full headers:`, JSON.stringify(req.headers))
  } else {
    console.log(`[Global Request Log] ${req.method} ${req.url} from User-Agent: ${userAgent}`)
  }
  next()
})

// 确保设备检测中间件在所有路由和静态资源之前执行

// 获取本地IP地址
function getLocalIP () {
  const interfaces = os.networkInterfaces()
  for (const devName in interfaces) {
    const iface = interfaces[devName]
    for (const alias of iface) {
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address
      }
    }
  }
}

// 生产环境挂载前端构建资源
const distPath = path.join(__dirname, '../../client/dist')
app.use(express.static(distPath))
console.log(`[Static Resource] Production client dist mounted at: ${distPath}`)

// 定义路由
app.use('/api/expenses', require('./routes/expenses'))
app.use('/api/todos', require('./routes/todos'))
app.use('/api/inventory', require('./routes/inventory'))
app.use('/api/blocklist', require('./routes/blocklist'))
app.use('/api/logs', require('./routes/logs'))
app.use('/api/json-files', require('./routes/jsonFiles'))
app.use('/api/auth', require('./routes/auth'))

// 添加请求日志中间件（记录请求路径和时间）
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})
// 挂载消费数据相关路由

// 移动请求体解析中间件到路由之前

// 优先处理/src路径的静态资源请求（确保开发模式下源文件正确加载）
// 开发模式优先加载前端源文件（Vite开发服务器），生产模式加载打包资源
// 开发模式：代理前端Vite开发服务器
// 注意：请确保前端Vite服务器在5173端口运行
// @file 服务端主入口文件
// @module app
// @package homemoney-server
// @project 家庭消费记录管理系统
// @description 仅开发模式启用前端资源代理中间件
if (process.env.NODE_ENV === 'development' && process.env.ENABLE_PROXY === 'true') {
  const { createProxyMiddleware } = require('http-proxy-middleware')

  // 配置前端代理（仅处理非API请求）
  app.use(createProxyMiddleware(/^(?!\/api).*/, {
    target: 'http://localhost:5173',
    changeOrigin: true,
    logLevel: 'debug',
    pathFilter: (path) => !path.startsWith('/api'), // 过滤掉/api路径
    pathRewrite: { '^/src': '/src' } // 保留/src路径前缀
  }))
}

// 启动服务器
// 开发环境保留原有src目录映射
const srcPath = path.join(__dirname, '../../client/src')
console.log(`[Static Resource] /src mapped to: ${srcPath}`)

// 优先挂载静态资源（public目录）以处理favicon.ico
const publicPath = path.join(__dirname, '../public')
app.use(express.static(publicPath))
console.log(`[Static Resource] Public directory mounted at: ${publicPath}`)

// 静态资源请求处理中间件（含成功/失败日志及核心服务）
app.use('/src',
  async (req, res, next) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`) // 解析URL获取不带查询参数的路径名
    const filePath = path.join(srcPath, pathname) // 使用pathname构建实际文件路径
    try {
      await fs.promises.access(filePath, fs.constants.F_OK)
    } catch (err) {
      console.warn(`[Static Resource] File not found: ${filePath}`) // 记录文件不存在警告
      return next()
    }
    console.log(`[Static Resource] Sending file: ${filePath}`) // 记录成功发送的文件路径
    next()
  },
  express.static(srcPath, {
    extensions: ['js', 'json', 'css'],
    fallthrough: true, // 未找到文件时继续传递请求
    onError: (err, req, res, next) => {
      console.error(`[Static Resource Error] Path: ${req.url}, Error Type: ${err.code}, Message: ${err.message}`)
      const { pathname: errorPathname } = new URL(req.url, `http://${req.headers.host}`)
      console.error(`[Debug] Resolved directory: ${srcPath}, File exists: ${fs.existsSync(path.join(srcPath, errorPathname))}`)
      if (err.code === 'ENOENT') {
        res.status(404).json({ error: '资源未找到' })
      } else {
        // 优化500错误提示，明确具体错误信息
        res.status(500).json({ error: `资源加载失败（${err.code}）：${err.message}，请检查文件权限或内容完整性` })
      }
    }
  })
)

// 生产环境优先返回Vue打包入口，开发环境由代理处理
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'))
  })
}
// 优先托管静态资源，确保资源请求先被处理
app.use(express.static(path.join(__dirname, '../public')))
// 配置exports目录为静态资源，用于CSV文件下载
app.use('/exports', express.static(path.join(__dirname, '../exports')))

// 公共资源服务放在路由之前，避免被API路由拦截

// 处理根路径请求，指向Vue打包后的入口文件
app.get('/', (req, res) => {
  const vueIndexPath = path.join(__dirname, '../../client/dist/index.html')
  res.sendFile(vueIndexPath)
})
// 处理favicon.ico请求
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/favicon.ico')) // 假设public目录有图标文件
})
// 原根路径请求处理
// 处理前端路由请求（仅生产模式生效）
// 通配符路由应放在最后
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // 指向前端打包后的入口文件
    res.sendFile(path.join(__dirname, '../../client/dist', 'index.html'))
  })
}

// 请求超时中间件
app.use((req, res, next) => {
  req.setTimeout(5000, () => {
    res.status(503).json({ error: '请求超时' })
  })
  next()
})

// 增强的错误处理中间件
app.use((err, req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173', 'http://192.168.0.197:5173', 'http://127.0.0.1:5173')
  console.error('路由错误:', err.stack)
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message,
      details: err.details
    },
    timestamp: new Date().toISOString()
  })
})

// 创建HTTP服务器
const server = http.createServer(app)

// 启动HTTPS服务器
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HTTP Server running on http://${getLocalIP()}:${PORT}`)
})
  .on('error', (err) => {
    console.error(`❌ HTTP Server failed to start: ${err.message}`)
    console.error('⚠️ 请检查端口是否被占用或服务器配置是否正确')
  })

// 挂载消费记录路由
const expenseRoutes = require('./routes/expenseRoutes')
app.use(expenseRoutes)

// 挂载基础健康检查路由（从routes目录引入）
const baseRoutes = require('./routes/baseRoutes')
app.use(baseRoutes)

// 挂载导出功能路由（从routes目录引入）
const exportRoutes = require('./routes/exportRoutes')
app.use(exportRoutes)

// 挂载配置查询路由
app.use('/api', require('./routes/api'))

// 在已有路由之后添加静态资源托管
app.use('/exports', express.static(path.join(__dirname, '../exports')))

// 健康检查端点路由
app.use('/api', require('./routes/api')) // 确保路由挂载路径正确

// 获取局域网IP辅助函数
