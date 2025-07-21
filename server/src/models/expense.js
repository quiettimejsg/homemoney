const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Expense = sequelize.define('Expense', {
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    remark: {
      type: DataTypes.STRING,
      allowNull: true
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false
    }
  })

  return Expense
} 