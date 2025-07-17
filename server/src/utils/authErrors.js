/**
 * 认证相关错误消息定义
 * 所有消息使用变量存储，避免硬编码
 */
module.exports = {
  // 用户未登录错误
  userNotLoggedIn: '用户未登录',
  // 无效的用户ID格式
  invalidUserIdFormat: '无效的用户ID格式',
  // 认证令牌缺失
  missingAuthToken: '认证令牌缺失',
  // 无效的认证令牌
  invalidAuthToken: '无效的认证令牌',
  // 令牌负载无效
  invalidTokenPayload: '令牌负载无效',
  // 令牌已过期
  tokenExpired: '令牌已过期',
  // 认证中间件错误
  authMiddlewareError: '认证处理错误'
}
