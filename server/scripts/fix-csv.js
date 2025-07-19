const fs = require('fs');
const path = require('path');

// 定义CSV文件路径
const csvFilePath = path.resolve(__dirname, '../exports/expenses_initial.csv');

// 读取CSV文件并修复数据格式
fs.readFile(csvFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('读取CSV文件时出错:', err);
    return;
  }

  // 按行分割数据，处理不同操作系统的换行符
  const lines = data.split(/\r?\n/);
  const fixedLines = [];

  // 保留表头行
  if (lines.length > 0) {
    fixedLines.push(lines[0]);

    // 处理数据行
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // 跳过空行

      // 按逗号分割字段
      const fields = line.split(',');
      const fieldCount = fields.length;

      // 如果字段数正好是4个，直接添加
      if (fieldCount === 4) {
        fixedLines.push(line);
      } else if (fieldCount > 4) {
        // 如果字段数超过4个，拆分多行
        for (let j = 0; j < fieldCount; j += 4) {
          const chunk = fields.slice(j, j + 4);
          fixedLines.push(chunk.join(','));
        }
      } else {
        // 字段数不足4个，原样保留
        fixedLines.push(line);
      }
    }
  }

  // 将修复后的数据写回文件
  fs.writeFile(csvFilePath, fixedLines.join('\n'), 'utf8', (err) => {
    if (err) {
      console.error('写入CSV文件时出错:', err);
      return;
    }
    console.log('CSV文件数据格式修复完成，所有行已确保最多包含4个数据字段。');
  });
});