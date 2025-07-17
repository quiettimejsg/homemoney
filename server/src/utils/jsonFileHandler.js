const fs = require('fs').promises
const path = require('path')

/**
 * 读取JSON文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<Object>} - 解析后的JSON对象
 */
async function readJsonFile (filePath) {
  try {
    const fullPath = path.resolve(filePath)
    const data = await fs.readFile(fullPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 文件不存在，返回空对象
      return {}
    }
    throw new Error(`读取JSON文件失败: ${error.message}`)
  }
}

/**
 * 写入JSON文件
 * @param {string} filePath - 文件路径
 * @param {Object} data - 要写入的数据
 * @returns {Promise<void>}
 */
async function writeJsonFile (filePath, data) {
  try {
    const fullPath = path.resolve(filePath)
    // 确保目录存在
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    throw new Error(`写入JSON文件失败: ${error.message}`)
  }
}

module.exports = {
  readJsonFile,
  writeJsonFile
}
