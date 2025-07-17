const jwt = require('jsonwebtoken')
// const { JWT_SECRET } = require('../../config/config')
const JWT_SECRET = process.env.JWT_SECRET
const apiResponse = require('../utils/apiResponse')
const authErrors = require('../utils/authErrors')

// 添加JWT_SECRET检测日志
console.log('[auth.js] 当前JWT_SECRET:', JWT_SECRET)

/**
 * 认证中间件 - 验证JWT令牌并设置用户ID
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express next函数
 */
const authenticate = (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiResponse.error(res, authErrors.missingAuthToken, 401)
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return apiResponse.error(res, authErrors.invalidAuthToken, 401)
    }

    // 验证令牌
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded.userId) {
      return apiResponse.error(res, authErrors.invalidTokenPayload, 401)
    }

    // 设置用户ID到请求对象
    req.userId = decoded.userId
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return apiResponse.error(res, authErrors.invalidAuthToken, 401)
    }
    if (error.name === 'TokenExpiredError') {
      return apiResponse.error(res, authErrors.tokenExpired, 401)
    }
    console.error('认证中间件错误:', error)
    return apiResponse.error(res, authErrors.authMiddlewareError, 500)
  }
}

module.exports = { authenticate }
