const { DataTypes } = require('sequelize')
const { sequelize } = require('../db') // 假设已存在数据库配置

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING(60),
    unique: true,
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.STRING(60),
    allowNull: false
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  totpSecret: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'TOTP密钥，用于2FA验证'
  }
})

module.exports = User
