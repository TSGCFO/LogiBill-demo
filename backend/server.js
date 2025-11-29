// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');
const { evaluateOrder } = require('./rulesEngine');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const EXCEL_FILE = path.join(DATA_DIR, 'vasanti_order_nov_23-nov_29.xlsx');
const ORDERS_FILE = path.join(DATA_DIR, 'vasanti_orders.json');
const RULES_FILE = path.join(DATA_DIR, 'rules.json');

function loadOrdersFromExcel() {
  console.log('Loading Excel from', EXCEL_FILE);
  const workbook = xlsx.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const orders = rows.map(row => ({
    transactionId: row['Transaction ID'],
    fields: row,
    metrics: {
      lineItems: row['Line Items'] || 0,
      totalItemQty: row['Total Item Qty'] || 0,
      packages: row['Packages'] || 0
    }
  }));

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  console.log(`Loaded ${orders.length} orders from Excel`);
  return orders;
}

function loadOrders() {
  if (fs.existsSync(ORDERS_FILE)) {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  }
  return loadOrdersFromExcel();
}

function loadRules() {
  if (fs.existsSync(RULES_FILE)) {
    return JSON.parse(fs.readFileSync(RULES_FILE, 'utf8'));
  }
  return [];
}

function saveRules(rules) {
  fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2));
}

let ORDERS = loadOrders();
let RULES = loadRules();

// ROUTES

// List subset of orders
app.get('/api/orders', (req, res) => {
  const limit = Number(req.query.limit || 100);
  res.json(ORDERS.slice(0, limit));
});

// Get one order by Transaction ID
app.get('/api/orders/:transactionId', (req, res) => {
  const id = req.params.transactionId;
  const order = ORDERS.find(o => String(o.transactionId) === String(id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Rules CRUD
app.get('/api/rules', (req, res) => {
  res.json(RULES);
});

app.post('/api/rules', (req, res) => {
  const rule = req.body;
  rule.id = rule.id || `rule_${Date.now()}`;
  if (rule.priority === undefined || rule.priority === null) {
    rule.priority = 100;
  }
  RULES.push(rule);
  saveRules(RULES);
  res.status(201).json(rule);
});

app.put('/api/rules/:id', (req, res) => {
  const id = req.params.id;
  const idx = RULES.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  RULES[idx] = { ...RULES[idx], ...req.body, id };
  saveRules(RULES);
  res.json(RULES[idx]);
});

app.delete('/api/rules/:id', (req, res) => {
  const id = req.params.id;
  RULES = RULES.filter(r => r.id !== id);
  saveRules(RULES);
  res.status(204).send();
});

// Simulate one order
app.get('/api/simulate/:transactionId', (req, res) => {
  const id = req.params.transactionId;
  const order = ORDERS.find(o => String(o.transactionId) === String(id));
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const result = evaluateOrder(order, RULES);
  res.json({ order, result });
});

// Simulate all orders
app.get('/api/simulate', (req, res) => {
  const results = ORDERS.map(order => ({
    transactionId: order.transactionId,
    result: evaluateOrder(order, RULES)
  }));
  res.json(results);
});

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
