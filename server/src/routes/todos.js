const express = require('express')
const router = express.Router()
const todosController = require('../controllers/todos')

router.get('/', todosController.getTodos)
router.post('/', todosController.saveTodos)

module.exports = router
