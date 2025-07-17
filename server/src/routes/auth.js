const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')

/**
 * 认证相关路由
 * @module routes/auth
 * @desc 处理用户登录、2FA验证等认证请求
 */

// 2FA登录验证
router.post('/login', authController.loginWith2FA)

// 生成TOTP密钥（用于用户启用2FA流程）
router.post('/generate-totp', authController.generateTOTPSecret)

// 用户注册路由
router.post('/register', authController.register)

// 注册验证码验证路由
router.post('/verify-register', authController.verifyRegister)

router.post('/logout', authController.logout)
router.get('/user', authenticate, authController.getUserInfo)

module.exports = router
