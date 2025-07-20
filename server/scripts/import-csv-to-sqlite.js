const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();

// 定义CSV文件路径和SQLite数据库路径
const csvFilePath = path.resolve(__dirname, '../exports/expenses_initial.csv');
const dbPath = path.resolve(__dirname, '../data/expenses.db');

// 确保data目录存在
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 连接SQLite数据库
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接错误:', err.message);
    process.exit(1);
  }
  console.log('成功连接到SQLite数据库');
});

// 创建expenses表
db.run(`CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  remark TEXT,
  amount REAL NOT NULL,
  time DATE NOT NULL
)`, (err) => {
  if (err) {
    console.error('创建表错误:', err.message);
    process.exit(1);
  }
  console.log('expenses表已准备就绪');

  // 导入CSV数据
  const results = [];
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // 准备插入语句
      const stmt = db.prepare(`INSERT INTO expenses (type, remark, amount, time) VALUES (?, ?, ?, ?)`);
      
      // 插入数据(跳过表头行)
      for (let i = 1; i < results.length; i++) {
        const row = results[i];
        const amount = parseFloat(row.amount);
        const time = row.time;
        
        stmt.run(row.type, row.remark, amount, time, (err) => {
          if (err) {
            console.error(`插入行 ${i + 1} 错误:`, err.message);
          } else if (i % 50 === 0) {
            console.log(`已处理 ${i} 行数据`);
          }
        });
      }
      
      stmt.finalize((err) => {
        if (err) {
          console.error('完成插入时错误:', err.message);
        } else {
          console.log(`所有数据插入完成，共处理 ${results.length - 1} 行`);
        }
        db.close((err) => {
          if (err) {
            console.error('关闭数据库错误:', err.message);
          } else {
            console.log('数据库连接已关闭');
          }
        });
      });
    });
});