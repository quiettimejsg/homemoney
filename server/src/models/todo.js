const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Todo = sequelize.define('Todo', {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  })

  return Todo
} 