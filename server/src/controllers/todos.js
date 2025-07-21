const { Todo, sequelize } = require('../db')

const getTodos = async (req, res) => {
  try {
    const todos = await Todo.findAll()
    res.status(200).json(todos)
  } catch (error) {
    console.error('Error reading todos:', error)
    res.status(500).json({ error: 'Failed to read todos' })
  }
}

const saveTodos = async (req, res) => {
  const todos = req.body
  if (!Array.isArray(todos)) {
    return res.status(400).json({ error: 'Todos must be an array' })
  }

  try {
    // 开启一个事务
    await sequelize.transaction(async (t) => {
      // 先删除所有旧的 todos
      await Todo.destroy({ where: {}, truncate: true, transaction: t })
      // 然后批量创建新的 todos
      await Todo.bulkCreate(todos, { transaction: t })
    })

    res.status(200).json({ message: 'Todos saved successfully' })
  } catch (error) {
    console.error('Error saving todos:', error)
    res.status(500).json({ error: 'Failed to save todos' })
  }
}

module.exports = {
  getTodos,
  saveTodos
}
