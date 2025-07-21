## [English](#en) | [中文](#zh)

<a id="en"></a>

# Final Version 10.0

# Household Finance Manager

## Project Overview
The Household Finance Manager is a multilingual financial management tool designed to help users easily track income/expenses, analyze spending patterns, and improve financial transparency. 

## Key Features
- **Multilingual Support**: Auto-adapting UI text & date formats (English etc.)
- **Expense Tracking**: Add/view records (type, amount, date, notes) with CSV auto-sync
- **Data Export**: Generate CSV reports (`server/exports/expenses_initial.csv`)
- **Smart Analytics**:
  - Category breakdowns (food, shopping, transport)
  - Interactive spending trend charts
  - Advanced search filters (by type, date range, amount)
- **Full-Stack Architecture**: Vue.js frontend + Node.js/Express backend (run via `npm run dev`)
- **Auto CSV Fix**: `run-fix-csv.bat` script to fix CSV encoding issues (e.g., Chinese characters)
- **Import/Export**: Import/export for backup/restore
- **Data Analytics**:
  - Category-wise spending analysis
  - Budget comparisons

## Setup & Usage
### Requirements
- Node.js ≥ 14.0.0 (18.x recommended)
- npm ≥ 6.0.0

### Quick Start
```bash
git clone https://github.com/quiettimejsg/homemoney.git
cd homemoney
npm install
cd client && npm install
cd ../server && npm install
npm run start  # Start both frontend and backend (http://localhost:3010)
```

## Security Note
**Important Security Warning:** npm may not directly fetch the secure version of the xlsx dependency (only version 0.18.5 might be available). To address critical security vulnerabilities, please download the secure version (0.20.2 or higher) from https://cdn.sheetjs.com/ and install manually using:
```bash
npm install ./xlsx.tgz
```

## Usage Guide
1. **Add records**: Click "Log Expense" > Fill form > Submit
2. **Switch languages**: Use dropdown at top-right

## Tech Stack
- Frontend: Vue 3 + Chart.js + Vue I18n
- Backend: Express + Papa Parse (CSV)
- Storage: CSV files (DB-ready architecture)

<a id="zh"></a>

# 最终版本 10.0

# 家庭财务管理系统

## 项目概述
家庭财务管理系统是一款多语言的财务管理工具，旨在帮助用户轻松跟踪收入/支出、分析消费模式并提高财务透明度。 

## 主要功能
- **多语言支持**：自动适配的用户界面文本和日期格式（英语等）
- **支出跟踪**：添加/查看记录（类型、金额、日期、备注），支持 CSV 自动同步
- **数据导出**：生成 CSV 报告（`server/exports/expenses_initial.csv`）
- **智能分析**：
  - 按类别分类（食品、购物、交通）
  - 交互式消费趋势图表
  - 高级搜索过滤器（按类型、日期范围、金额）
- **全栈架构**：Vue.js 前端 + Node.js/Express 后端（通过 `npm run dev` 运行）
- **CSV 自动修复**：`run-fix-csv.bat` 脚本用于修复 CSV 编码问题（例如中文字符）
- **导入/导出**：支持导入/导出以进行备份/恢复
- **数据分析**：
  - 按类别进行消费分析
  - 预算对比

## 设置与使用
### 要求
- Node.js ≥ 14.0.0（推荐 18.x 版本）
- npm ≥ 6.0.0

### 快速开始
```bash
git clone https://github.com/quiettimejsg/homemoney.git
cd homemoney
npm install
cd client && npm install
cd ../server && npm install
npm run start  # 启动前端和后端服务 (http://localhost:3010)
```

## 安全注意事项
**重要安全警告**：npm 可能无法直接获取 xlsx 依赖项的安全版本（可能仅提供 0.18.5 版本）。为解决严重的安全漏洞，请从 https://cdn.sheetjs.com/ 下载安全版本（0.20.2 或更高版本），并使用以下命令手动安装：
```bash
npm install ./xlsx.tgz
```

## 使用指南
1. **添加记录**：点击 "记录支出" > 填写表单 > 提交
2. **切换语言**：使用右上角的下拉菜单

## 技术栈
- 前端：Vue 3 + Chart.js + Vue I18n
- 后端：Express + Papa Parse (CSV)
- 存储：CSV 文件（支持数据库的架构）
