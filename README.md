# Final Version 8.0

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
