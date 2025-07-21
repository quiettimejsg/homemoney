const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Inventory = sequelize.define('Inventory', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    lowStockThreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    }
  })

  return Inventory
} 