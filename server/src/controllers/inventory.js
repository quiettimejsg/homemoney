const { Inventory } = require('../db')

const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll()
    res.status(200).json(inventory)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve inventory' })
  }
}

const addInventoryItem = async (req, res) => {
  try {
    const newItem = await Inventory.create(req.body)
    res.status(201).json(newItem)
  } catch (error) {
    res.status(400).json({ error: 'Failed to add inventory item' })
  }
}

const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params
    const [updated] = await Inventory.update(req.body, { where: { id: id } })
    if (updated) {
      const updatedItem = await Inventory.findByPk(id)
      res.status(200).json(updatedItem)
    } else {
      res.status(404).json({ error: 'Inventory item not found' })
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to update inventory item' })
  }
}

const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Inventory.destroy({ where: { id: id } })
    if (deleted) {
      res.status(204).send()
    } else {
      res.status(404).json({ error: 'Inventory item not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inventory item' })
  }
}

module.exports = {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
}
