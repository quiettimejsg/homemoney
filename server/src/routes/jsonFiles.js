const express = require('express')
const router = express.Router()
const { readJsonFile, writeJsonFile } = require('../utils/jsonFileHandler')
const path = require('path')
const fs = require('fs').promises

// 定义JSON文件存储目录
const JSON_STORAGE_DIR = path.join(__dirname, '../../data/json-files')

/**
 * @route GET /api/json-files/:filename
 * @desc 读取指定JSON文件
 * @access Public
 */
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const filePath = path.join(JSON_STORAGE_DIR, `${filename}.json`)
    const data = await readJsonFile(filePath)
    res.status(200).json({
      success: true,
      data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `读取文件失败: ${error.message}`
    })
  }
})

/**
 * @route POST /api/json-files/:filename
 * @desc 写入数据到指定JSON文件
 * @access Public
 */
router.post('/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const fileData = req.body
    const filePath = path.join(JSON_STORAGE_DIR, `${filename}.json`)

    await writeJsonFile(filePath, fileData)
    res.status(200).json({
      success: true,
      message: '文件写入成功',
      filePath
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `写入文件失败: ${error.message}`
    })
  }
})

/**
 * @route GET /api/json-files
 * @desc 获取所有JSON文件列表
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    // 确保存储目录存在
    await fs.mkdir(JSON_STORAGE_DIR, { recursive: true })
    const files = await fs.readdir(JSON_STORAGE_DIR)
    const jsonFiles = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))

    res.status(200).json({
      success: true,
      files: jsonFiles
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `获取文件列表失败: ${error.message}`
    })
  }
})

/**
 * @route DELETE /api/json-files/:filename
 * @desc 删除指定JSON文件
 * @access Public
 */
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const filePath = path.join(JSON_STORAGE_DIR, `${filename}.json`)

    // 检查文件是否存在
    try {
      await fs.access(filePath)
    } catch {
      return res.status(404).json({
        success: false,
        error: '文件不存在'
      })
    }

    await fs.unlink(filePath)
    res.status(200).json({
      success: true,
      message: '文件删除成功'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `删除文件失败: ${error.message}`
    })
  }
})

module.exports = router
