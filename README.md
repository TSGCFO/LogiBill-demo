# Vasanti Outbound Billing Demo

A complete local application for defining outbound billing rules and simulating fees per order using Vasanti Excel data.

## Project Structure

```
LogiBill-demo/
├── backend/              # Node.js + Express API
│   ├── package.json
│   ├── server.js
│   ├── rulesEngine.js
│   └── data/
│       ├── README.md
│       └── vasanti_order_nov_23-nov_29.xlsx  (place your Excel file here)
└── frontend/             # React + Vite UI
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── Orders.jsx
        ├── RuleBuilder.jsx
        └── Simulator.jsx
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Your Vasanti Excel file: `vasanti_order_nov_23-nov_29.xlsx`

### Step 1: Add Your Excel File
Place `vasanti_order_nov_23-nov_29.xlsx` in the `backend/data/` directory.

### Step 2: Install & Run Backend

```bash
cd backend
npm install
npm start
```

Backend will run at: `http://localhost:4000`

### Step 3: Install & Run Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will open at: `http://localhost:5173`

## Features

### 1. Orders Tab
- View all orders from your Excel file
- See order details (all 49+ WMS fields)
- Simulate billing for individual orders

### 2. Rule Builder Tab
- Create billing rules with no-code UI
- Define conditions based on any Excel column
- Set up charges:
  - Per order (flat fee)
  - Per SKU (Line Items)
  - Per unit (Total Item Qty)
  - Per package
- Create skip rules (e.g., skip cancelled orders)

### 3. Simulator Tab
- Test single order by Transaction ID
- Run simulation on all orders
- See breakdown of charges per order
- Identify which rule was applied

## Example Rules to Create

### Skip Cancelled Orders
- Name: "Skip cancelled orders"
- Effect: "Skip billing for this order"
- Condition: Status equals "Cancelled"

### Vasanti Outbound Pricing
- Name: "Vasanti outbound"
- Effect: "Apply charges"
- Conditions:
  - Billing Type equals "Outbound"
  - Customer equals "Vasanti Cosmetics"
- Charges:
  - Base order fee: $2.60 (flat)
  - Per SKU: $0.22 (per SKU)
  - Per pick: $0.17 (per unit)

## API Endpoints

- `GET /api/orders` - List orders
- `GET /api/orders/:transactionId` - Get specific order
- `GET /api/rules` - List rules
- `POST /api/rules` - Create rule
- `PUT /api/rules/:id` - Update rule
- `DELETE /api/rules/:id` - Delete rule
- `GET /api/simulate/:transactionId` - Simulate single order
- `GET /api/simulate` - Simulate all orders

## Technology Stack

- **Backend**: Node.js, Express, xlsx
- **Frontend**: React 18, Vite
- **Data**: Excel (XLSX) with JSON caching
